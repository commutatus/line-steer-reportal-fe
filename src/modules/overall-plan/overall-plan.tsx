import React, { useMemo } from 'react';
import RootLayout from '@/common/layouts/root-layout';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useQuery } from '@apollo/client';
import { GetOverallPlanQuery, GetOverallPlanQueryVariables, LoadScheduleDaySortColumn, SortDirection } from '@/generated/graphql';
import { OVERALL_PLAN_QUERY } from '@/common/graphql/consumer.graphql';
import { useGlobals } from '@/common/context/globals';
import { UserType } from '@/common/hooks/useCurrentUser';

const presentDate = dayjs();

interface TableRow {
  key: number;
  date: string;
  total: number;
  [key: string]: string | number;
}

const OverallPlan = () => {
  const { data } = useQuery<GetOverallPlanQuery, GetOverallPlanQueryVariables>(OVERALL_PLAN_QUERY, {
    variables: {
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
      filters: {
        dateRange: {
          from: presentDate.startOf('month').toISOString(),
          to: presentDate.endOf('month').toISOString(),
        }
      }
    }
  });

  const { currentUser } = useGlobals();
  const { userType } = currentUser ?? {};
  const overallPlan = useMemo(() => data?.loadSummary?.data ?? [], [data]);

  const availableParks = useMemo(() => {
    if (!overallPlan.length) return [];
    const parkMap = new Map();
    overallPlan.forEach((day) => {
      day.parkLoads?.forEach((parkLoad) => {
        if (parkLoad.park?.id && parkLoad.park?.name) {
          parkMap.set(parkLoad.park.id, parkLoad.park.name);
        }
      });
    });
    return Array.from(parkMap, ([id, name]) => ({ id, name }));
  }, [overallPlan]);

  const availableFactories = useMemo(() => {
    if (!overallPlan.length) return [];
    const factoryMap = new Map();
    overallPlan.forEach((day) => {
      day.factoryLoads?.forEach((factoryLoad) => {
        if (factoryLoad.factory?.id && factoryLoad.factory?.name) {
          factoryMap.set(factoryLoad.factory.id, factoryLoad.factory.name);
        }
      });
    });
    return Array.from(factoryMap, ([id, name]) => ({ id, name }));
  }, [overallPlan]);

  const tableData = useMemo(() => {
    return overallPlan.map((item, index) => {
      const row: TableRow = {
        key: index,
        date: item.date,
        total: userType === UserType.CONSUMER ? item.totalParkLoad : item.totalFactoryLoad,
      };

      if (userType === UserType.CONSUMER) {
        item.parkLoads?.forEach((parkLoad) => {
          if (parkLoad.park?.id) {
            row[`park_${parkLoad.park.id}`] = parkLoad.totalLoad;
          }
        });
      } else {
        item.factoryLoads?.forEach((factoryLoad) => {
          if (factoryLoad.factory?.id) {
            row[`factory_${factoryLoad.factory.id}`] = factoryLoad.totalLoad;
          }
        });
      }
      return row;
    });
  }, [overallPlan, userType]);

  const columns: ColumnsType<TableRow> = useMemo(() => {
    const cols: ColumnsType<TableRow> = [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      },
    ];

    if (userType === UserType.CONSUMER) {
      availableParks.forEach((park) => {
        cols.push({
          title: park.name,
          dataIndex: `park_${park.id}`,
          key: `park_${park.id}`,
          align: 'right',
          render: (val: number | undefined) => val?.toFixed(2) ?? '0.00',
        });
      });
    } else {
      availableFactories.forEach((factory) => {
        cols.push({
          title: factory.name,
          dataIndex: `factory_${factory.id}`,
          key: `factory_${factory.id}`,
          align: 'right',
          render: (val: number | undefined) => val?.toFixed(2) ?? '0.00',
        });
      });
    }

    cols.push({
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (val: number | undefined) => <span className="font-semibold">{val?.toFixed(2) ?? '0.00'}</span>,
    });

    return cols;
  }, [availableParks, availableFactories, userType]);

  return (
    <RootLayout pageTitle="Overall Plan">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold">Overall Plan Report</h2>
          </div>
          <div className="p-6">
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={false}
            />
            <div className="mt-4 text-sm text-slate-500">
              All values are in MWh (Megawatt-hours)
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default OverallPlan;

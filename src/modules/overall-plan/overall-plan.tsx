import React, { useMemo } from 'react';
import RootLayout from '@/common/layouts/root-layout';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { gql, useQuery } from '@apollo/client';
import { GetOverallPlanQuery, GetOverallPlanQueryVariables } from '@/generated/graphql';

const OVERALL_PLAN_QUERY = gql`
  query GetOverallPlan($filters: LoadScheduleDayFilterInput) {
    dailyLoadSummary (filters: $filters){
      data {
        date
        totalLoad
        parkLoads {
          totalLoad
          park {
            id
            name
          }
        }
      }
    }
  }
`;

interface TableRow {
  key: number;
  date: string;
  total: number;
  [key: string]: string | number;
}

const OverallPlan = () => {
  const { data } = useQuery<GetOverallPlanQuery, GetOverallPlanQueryVariables>(OVERALL_PLAN_QUERY);
  const overallPlan = useMemo(() => data?.dailyLoadSummary?.data ?? [], [data]);

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

  const tableData = useMemo(() => {
    return overallPlan.map((item, index) => {
      const row: TableRow = {
        key: index,
        date: item.date,
        total: item.totalLoad,
      };
      
      item.parkLoads?.forEach((parkLoad) => {
        if (parkLoad.park?.id) {
          row[`park_${parkLoad.park.id}`] = parkLoad.totalLoad;
        }
      });
      
      return row;
    });
  }, [overallPlan]);

  const columns: ColumnsType<TableRow> = useMemo(() => {
    const cols: ColumnsType<TableRow> = [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      },
    ];

    availableParks.forEach((park) => {
      cols.push({
        title: park.name,
        dataIndex: `park_${park.id}`,
        key: `park_${park.id}`,
        align: 'right',
        render: (val: number | undefined) => val?.toFixed(2) ?? '0.00',
      });
    });

    cols.push({
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (val: number | undefined) => <span className="font-semibold">{val?.toFixed(2) ?? '0.00'}</span>,
    });

    return cols;
  }, [availableParks]);

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

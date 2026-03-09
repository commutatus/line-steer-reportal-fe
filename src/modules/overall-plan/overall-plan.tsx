import RootLayout from '@/common/layouts/root-layout';
import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  GetLoadScheduleDaysQuery,
  GetLoadScheduleDaysQueryVariables,
  LoadScheduleDaySortColumn,
  LoadScheduleDayStatusEnum,
  SortDirection,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client';
import { GET_LOAD_SCHEDULED_DAYS } from '@/common/graphql/consumer.graphql';
import { Table, Select, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fillConfig } from '@/common/constants/plan-status';
import { useGlobals } from '@/common/context/globals';
import ExportFactoryDetailsButton from '../consumer/components/ExportFactoryDetailsButton';
import DayViewModal from '@/common/components/day-view-modal/day-view-modal';
import { FilterOutlined } from '@ant-design/icons';
import StatusTag from '@/common/status-tag';

const presentDate = dayjs();

interface TableRow {
  key: string;
  date: string;
  [key: string]: string | LoadScheduleDayStatusEnum | null | undefined;
}

const OverAllPlan = () => {
  const { currentPark, notificationApi } = useGlobals();
  const { parks } = currentPark ?? {};
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  const [isDayViewOpen, setIsDayViewOpen] = useState(false);
  const [selectedLoadScheduleDayId, setSelectedLoadScheduleDayId] = useState<number | null>(null);

  const dateRange = {
    from: presentDate.startOf('month').format('YYYY-MM-DD'),
    to: presentDate.endOf('month').format('YYYY-MM-DD'),
  };

  const { data, loading: isLoading } = useQuery<
    GetLoadScheduleDaysQuery,
    GetLoadScheduleDaysQueryVariables
  >(GET_LOAD_SCHEDULED_DAYS, {
    variables: {
      filters: {
        dateRange,
        parkIds: selectedParkId ? [selectedParkId] : undefined,
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
    },
    skip: !selectedParkId
  });

  const loadScheduleDays = useMemo(() => data?.loadScheduleDays?.data ?? [], [data]);

  const availableFactories = useMemo(() => {
    const factoryMap = new Map<string, string>();
    loadScheduleDays.forEach((day) => {
      if (day.factory?.id && day.factory?.name) {
        factoryMap.set(day.factory.id, day.factory.name);
      }
    });
    return Array.from(factoryMap, ([id, name]) => ({ id, name }));
  }, [loadScheduleDays]);

  const tableData = useMemo((): TableRow[] => {
    const dateMap = new Map<string, TableRow>();

    loadScheduleDays.forEach((day) => {
      const existing = dateMap.get(day.date);

      if (existing) {
        if (day.factory?.id) {
          existing[`factory_${day.factory.id}`] = day.status;
        }
      } else {
        const row: TableRow = {
          key: day.date,
          date: day.date,
        };
        if (day.factory?.id) {
          row[`factory_${day.factory.id}`] = day.status;
        }
        dateMap.set(day.date, row);
      }
    });

    return Array.from(dateMap.values());
  }, [loadScheduleDays]);

  const handleStatusClick = useCallback((date: string, factoryId: string) => {
    const loadScheduleDay = loadScheduleDays.find(
      (day) => day.date === date && day.factory?.id === factoryId
    );
    if (loadScheduleDay?.id) {
      setSelectedLoadScheduleDayId(Number(loadScheduleDay.id));
      setIsDayViewOpen(true);
    } else {
      notificationApi?.error({
        message: "No plan found for this date",
      });
    }
  }, [loadScheduleDays, notificationApi]);

  const columns: ColumnsType<TableRow> = useMemo(() => {
    const cols: ColumnsType<TableRow> = [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        fixed: 'left',
        width: 140,
        render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      },
    ];

    availableFactories.forEach((factory) => {
      cols.push({
        title: factory.name,
        dataIndex: `factory_${factory.id}`,
        key: `factory_${factory.id}`,
        align: 'center',
        render: (status: LoadScheduleDayStatusEnum | null | undefined, record: TableRow) => {
          if (!status) {
            return <span className="text-gray-400">—</span>;
          }
          const config = fillConfig[status];
          if (!config) {
            return <span className="text-gray-400">—</span>;
          }
          return (
            <StatusTag
              status={status}
              onClick={() => handleStatusClick(record.date, factory.id)}
            />
          );
        },
      });
    });

    cols.push({
      title: '',
      key: 'export',
      width: 60,
      render: (_: unknown, record: TableRow) => (
        <ExportFactoryDetailsButton date={{ from: record.date, to: record.date }} />
      ),
    });

    return cols;
  }, [availableFactories, handleStatusClick]);

  const parkOptions = useMemo(() => {
    return (parks ?? []).map((park) => ({
      label: park.name ?? park.id,
      value: park.id,
    }));
  }, [parks]);

  return (
    <RootLayout pageTitle="Overall Plan">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Overall Plan Report</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                placeholder="Select a Park"
                allowClear
                className="w-[220px]!"
                value={selectedParkId}
                onChange={(val) => setSelectedParkId(val ?? null)}
                options={parkOptions}
              />
              {selectedParkId && (
                <>
                  <ExportFactoryDetailsButton
                    label="Previous 7 Days"
                    date={{
                      from: presentDate.subtract(7, 'day').format('YYYY-MM-DD'),
                      to: presentDate.format('YYYY-MM-DD'),
                    }}
                  />
                  <ExportFactoryDetailsButton
                    label="Next 7 Days"
                    date={{
                      from: presentDate.format('YYYY-MM-DD'),
                      to: presentDate.add(7, 'day').format('YYYY-MM-DD'),
                    }}
                  />
                </>
              )}
            </div>
          </div>
          <div className="p-6">
            {
              selectedParkId ? (
                <Table
                  dataSource={selectedParkId ? tableData: []}
                  columns={columns}
                  pagination={false}
                  loading={isLoading}
                  scroll={{ x: 'max-content' }}
                  size="small"
                />
              )
              : (
                <Empty
                  image={
                    <FilterOutlined
                      className="text-gray-300! text-[64px]"
                    />
                  }
                  description={
                    <div className="text-center">
                      <p className="text-lg font-medium mb-1">
                        Select a Park to get started
                      </p>
                      <p className="text-gray-500 text-sm">
                        Choose a park from the dropdown above to view its factories and plans.
                      </p>
                    </div>
                  }
                />
              )
            }
          </div>
        </div>
      </div>
      <DayViewModal
        loadScheduleDayId={selectedLoadScheduleDayId}
        open={isDayViewOpen}
        onOpenChange={setIsDayViewOpen}
      />
    </RootLayout>
  );
};

export default OverAllPlan;

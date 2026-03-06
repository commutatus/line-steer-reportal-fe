import { useState, useMemo } from "react";
import RootLayout from "@/common/layouts/root-layout";
import { Table, Select, Tag, DatePicker } from "antd";
import {
  GetLoadScheduleDaysQuery,
  GetLoadScheduleDaysQueryVariables,
  LoadScheduleDaySortColumn,
  LoadScheduleDayStatusEnum,
  SortDirection,
} from "@/generated/graphql";
import { fillConfig, PlanStatus } from "@/common/constants/plan-status";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs, { Dayjs } from "dayjs";
import { useQuery } from "@apollo/client";
import { GET_LOAD_SCHEDULED_DAYS } from "@/common/graphql/consumer.graphql";
import { useGlobals } from "@/common/context/globals";
import ExportScheduleButton from "../consumer/components/ExportScheduleButton";
import DayViewModal from "@/common/components/day-view-modal/day-view-modal";
import { LoadScheduleDay } from "@/common/types/load-schedule";

const { RangePicker } = DatePicker;

const presentDate = dayjs();

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: LoadScheduleDayStatusEnum.Pending },
  { label: "In Progress", value: LoadScheduleDayStatusEnum.InProgress },
  { label: "Planned", value: LoadScheduleDayStatusEnum.Ready },
];

const DayWisePlanGenerator = () => {
  const { currentPark } = useGlobals();
  const { parks, factories } = currentPark ?? {};

  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<
    LoadScheduleDayStatusEnum | "all"
  >("all");
  const [dateRangeValue, setDateRangeValue] = useState<
    [Dayjs, Dayjs]
  >([presentDate.startOf("month"), presentDate.endOf("month")]);
  const [isDayViewOpen, setIsDayViewOpen] = useState(false);
  const [selectedLoadScheduleDayId, setSelectedLoadScheduleDayId] =
    useState<number | null>(null);

  const dateRange = useMemo(
    () => ({
      from: dateRangeValue[0].format("YYYY-MM-DD"),
      to: dateRangeValue[1].format("YYYY-MM-DD"),
    }),
    [dateRangeValue]
  );

  const { data, loading: isLoading } = useQuery<
    GetLoadScheduleDaysQuery,
    GetLoadScheduleDaysQueryVariables
  >(GET_LOAD_SCHEDULED_DAYS, {
    variables: {
      filters: {
        dateRange,
        parkIds: selectedParkId ? [selectedParkId] : undefined,
        factoryIds: selectedFactoryId ? [selectedFactoryId] : undefined,
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
    },
  });

  const loadScheduleDays = useMemo(
    () => data?.loadScheduleDays?.data ?? [],
    [data]
  );

  const filteredData = useMemo(() => {
    if (statusFilter === "all") {
      return loadScheduleDays;
    }
    return loadScheduleDays.filter((item) => item.status === statusFilter);
  }, [loadScheduleDays, statusFilter]);

  const tableData = useMemo(() => {
    return filteredData.map((item) => ({
      key: item.id,
      date: item.date,
      parkName: item.park?.name ?? "—",
      factoryName: item.factory?.name ?? "—",
      status: item.status,
      raw: item,
    }));
  }, [filteredData]);

  const handleStatusClick = (record: LoadScheduleDay) => {
    setSelectedLoadScheduleDayId(Number(record.id));
    setIsDayViewOpen(true);
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setDateRangeValue([dates[0], dates[1]]);
    }
  };

  const handleParkChange = (value: string | undefined) => {
    setSelectedParkId(value ?? null);
    setSelectedFactoryId(null);
  };

  const parkOptions = useMemo(() => {
    return (parks ?? []).map((park) => ({
      label: park.name ?? park.id,
      value: park.id,
    }));
  }, [parks]);

  const factoryOptions = useMemo(() => {
    return (factories ?? []).map((factory) => ({
      label: factory.name ?? factory.id,
      value: factory.id,
    }));
  }, [factories]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Park",
      dataIndex: "parkName",
      key: "parkName",
    },
    {
      title: "Factory",
      dataIndex: "factoryName",
      key: "factoryName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (
        status: LoadScheduleDayStatusEnum,
        record: (typeof tableData)[number]
      ) => {
        const config = fillConfig[status as PlanStatus];
        if (!config) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <Tag
            color={config.color}
            className="cursor-pointer"
            onClick={() => handleStatusClick(record.raw as LoadScheduleDay)}
          >
            <FontAwesomeIcon icon={config.icon} /> {config.label}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "export",
      width: 60,
      render: (_: unknown, record: (typeof tableData)[number]) => (
        <ExportScheduleButton
          date={{ from: record.date, to: record.date }}
        />
      ),
    },
  ];

  return (
    <RootLayout pageTitle="Day Wise Plan">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold mb-2!">Day Wise Plan Report</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <RangePicker
                value={dateRangeValue}
                onChange={handleDateRangeChange}
              />
              <Select
                placeholder="Select a Park"
                allowClear
                className="w-[200px]!"
                value={selectedParkId}
                onChange={handleParkChange}
                options={parkOptions}
              />
              <Select
                placeholder="All Factories"
                allowClear
                className="w-[200px]!"
                value={selectedFactoryId}
                onChange={(val) => setSelectedFactoryId(val ?? null)}
                options={factoryOptions}
                disabled={!selectedParkId}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                className="w-[150px]!"
              />
            </div>
          </div>
          <div className="p-6">
            <Table
              dataSource={tableData}
              columns={columns}
              loading={isLoading}
              size="small"
            />
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

export default DayWisePlanGenerator;

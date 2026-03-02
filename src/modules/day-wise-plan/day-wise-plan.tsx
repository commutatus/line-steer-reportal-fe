import { useState, useMemo } from "react";
import RootLayout from "@/common/layouts/root-layout";
import { Table, Select, Tag } from "antd";
import { GetDayWisePlanQueryQuery, GetDayWisePlanQueryQueryVariables, LoadScheduleDaySortColumn, LoadScheduleDayStatusEnum, SortDirection } from "@/generated/graphql";
import { fillConfig } from "../consumer/components/consumer-utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import { DAY_WISE_PLAN_QUERY } from "@/common/graphql/consumer.graphql";
import { useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";

const presentDate = dayjs();

const DayWisePlan = () => {
  const { currentUser } = useGlobals();
  const { userType } = currentUser ?? {};
  const [statusFilter, setStatusFilter] = useState<LoadScheduleDayStatusEnum | "all">("all");

  const { data } = useQuery<GetDayWisePlanQueryQuery, GetDayWisePlanQueryQueryVariables>(DAY_WISE_PLAN_QUERY, {
    variables: {
      filters: {
        dateRange: {
          from: presentDate.startOf("month").toISOString(),
          to: presentDate.endOf("month").toISOString(),
        }
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
    }
  });

  const dayWisePlan = useMemo(() => data?.loadScheduleDays?.data ?? [], [data]);

  const filteredData = useMemo(() => {
    if (statusFilter === "all") {
      return dayWisePlan;
    }
    return dayWisePlan.filter((item) => item.status === statusFilter);
  }, [dayWisePlan, statusFilter]);

  const tableData = useMemo(() => {
    const isConsumerUser = userType === UserType.CONSUMER;
    return filteredData.map((item, index) => ({
      key: index,
      date: item.date,
      plant: isConsumerUser ? item.park?.name : item.factory?.name,
      totalLoad: item.totalLoad,
      status: item.status,
    }));
  }, [filteredData, userType]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Plant",
      dataIndex: "plant",
      key: "plant",
    },
    {
      title: "Total Load (MW)",
      dataIndex: "totalLoad",
      key: "totalLoad",
      align: "right" as const,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: LoadScheduleDayStatusEnum) => {
        const config = fillConfig[status];
        return (
          <Tag color={config.color}>
            <FontAwesomeIcon icon={config.icon} /> {config.label}
          </Tag>
        );
      },
    },
  ];

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "To Do", value: LoadScheduleDayStatusEnum.Pending },
    { label: "In Progress", value: LoadScheduleDayStatusEnum.InProgress },
    { label: "Planned", value: LoadScheduleDayStatusEnum.Ready },
  ];

  return (
    <RootLayout pageTitle="Day Wise Plan">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Day Wise Plan Report</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Filter by Status:</span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                style={{ width: 150 }}
              />
            </div>
          </div>
          <div className="p-6">
            <Table
              dataSource={tableData}
              columns={columns}
            />
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default DayWisePlan;

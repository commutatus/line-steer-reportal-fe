import React, { useMemo, useState } from "react";
import RootLayout from "@/common/layouts/root-layout";
import { Empty, Spin, Tabs } from "antd";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import { GET_LOAD_SCHEDULED_DAYS } from "@/common/graphql/consumer.graphql";
import { GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables, LoadScheduleDaySortColumn, SortDirection } from "@/generated/graphql";
import { CalendarPlan, TablePlan } from "@/common/components/plan-views";
import { LoadScheduleDay } from "@/common/types/load-schedule";
import GeneratorFilters from "@/common/components/generator-filters";
import GeneratorDayViewModal from "./components/GeneratorDayViewModal";
import { FilterOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

const presentDate = dayjs();

const Generator = () => {
  const router = useRouter();
  const parkId = typeof router.query.parkId === "string" ? router.query.parkId : null;
  const factoryId = typeof router.query.factoryId === "string" ? router.query.factoryId : null;

  const [currentDate, setCurrentDate] = useState<dayjs.Dayjs>(presentDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDayViewOpen, setIsDayViewOpen] = useState(false);

  const hasSelection = Boolean(parkId && factoryId);

  const { data, loading: loadScheduledDaysLoading } = useQuery<GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables>(GET_LOAD_SCHEDULED_DAYS, {
    variables: {
      filters: {
        parkIds: parkId ? [parkId] : undefined,
        factoryIds: factoryId ? [factoryId] : undefined,
        dateRange: {
          from: currentDate.startOf("month").format("YYYY-MM-DD"),
          to: currentDate.endOf("month").format("YYYY-MM-DD"),
        },
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
    },
    skip: !hasSelection,
  });

  const loadScheduledDays = useMemo(() => data?.loadScheduleDays?.data ?? [], [data]);

  const selectedLoadScheduleDay = useMemo((): LoadScheduleDay | null => {
    if (!selectedDate) {
      return null;
    }
    return loadScheduledDays.find((day) => day.date === selectedDate) ?? null;
  }, [selectedDate, loadScheduledDays]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayViewOpen(true);
  };

  const handleDateChange = (date: dayjs.Dayjs) => {
    setCurrentDate(date);
  };

  const tabItems = [
    {
      key: "calendar",
      label: "Calendar",
      children: (
        <CalendarPlan
          loadScheduledDays={loadScheduledDays}
          onDayClick={handleDayClick}
          currentDate={currentDate}
          onDateChange={handleDateChange}
          description="Click on any day to view the daily plan"
        />
      ),
    },
    {
      key: "table",
      label: "Table",
      children: (
        <TablePlan
          loadScheduledDays={loadScheduledDays}
          onDayClick={handleDayClick}
        />
      ),
    },
  ];

  if (loadScheduledDaysLoading) {
    return (
      <RootLayout pageTitle="Requests" navbarExtra={<GeneratorFilters />}>
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout pageTitle="Requests" navbarExtra={<GeneratorFilters />}>
      <div className="p-6">
        {!hasSelection ? (
          <div
            className="flex items-center justify-center min-h-[calc(100vh-200px)]"
          >
            <Empty
              image={
                <FilterOutlined
                  className="text-gray-300! text-[64px]"
                />
              }
              description={
                <div className="text-center">
                  <p className="text-lg font-medium mb-1">
                    {!parkId
                      ? "Select a Park to get started"
                      : "Now select a Factory"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {!parkId
                      ? "Choose a park from the dropdown above to view its factories and plans."
                      : "Pick a factory from the dropdown to view its calendar and daily plans."}
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <Tabs defaultActiveKey="calendar" items={tabItems} />
        )}
      </div>

      <GeneratorDayViewModal
        loadScheduleDay={selectedLoadScheduleDay}
        open={isDayViewOpen}
        onOpenChange={setIsDayViewOpen}
      />
    </RootLayout>
  );
};

export default Generator;

import { useMemo, useState } from "react";
import { Empty, Modal, Tabs } from "antd";
import RootLayout from "@/common/layouts/root-layout";
import { CalendarPlan, TablePlan } from "@/common/components/plan-views";
import AuditHistoryTab from "@/common/components/audit-history-tab/AuditHistoryTab";
import DayPlanSheet from "./components/DayPlanSheet";
import DayViewModal from "@/common/components/day-view-modal";
import { useQuery } from "@apollo/client";
import { GET_LOAD_SCHEDULED_DAYS } from "@/common/graphql/consumer.graphql";
import { GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables, LoadScheduleDaySortColumn, SortDirection } from "@/generated/graphql";
import dayjs from "dayjs";
import { useGlobals } from "@/common/context/globals";
import { FilterOutlined } from "@ant-design/icons";
import { faBan } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageLoader from "@/common/components-ui/page-loader/page-loader";
import GeneratorFilters from "@/common/components/generator-filters";

const presentDate = dayjs();

const Consumer = () => {
  const { currentPark } = useGlobals();
  const { parkId, factoryId } = currentPark ?? {};
  const hasSelection = Boolean(parkId && factoryId);
  const [currentDate, setCurrentDate] = useState<dayjs.Dayjs>(presentDate);

  const { data: loadScheduledDaysData, loading: loadScheduledDaysLoading } = useQuery<GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables>(GET_LOAD_SCHEDULED_DAYS, {
    variables: {
      filters: {
        parkIds: parkId ? [parkId] : undefined,
        factoryIds: factoryId ? [factoryId] : undefined,
        dateRange: {
          from: currentDate.startOf("month").format("YYYY-MM-DD"),
          to: currentDate.endOf("month").format("YYYY-MM-DD"),
        }
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
    },
    skip: !hasSelection,
  });
  const loadScheduledDays = useMemo(() => loadScheduledDaysData?.loadScheduleDays?.data ?? [], [loadScheduledDaysData]);

  const [isDayPlanSheetOpen, setIsDayPlanSheetOpen] = useState(false);
  const [isDayViewModalOpen, setIsDayViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLoadScheduleDayId, setSelectedLoadScheduleDayId] = useState<number | null>(null);

  const handleDayClick = (date: string) => {
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === date);
    if (!loadScheduleDay?.status) {
      const formattedDate = dayjs(date).format("MMMM D, YYYY");
      Modal.info({
        icon: <FontAwesomeIcon icon={faBan} className="text-red-500 text-2xl mr-2" />,
        title: "Load Schedule Unavailable",
        content: `Load schedule is not available for ${formattedDate}. Please try again sometime later.`,
        okText: "Close",
      });
      return;
    }
    const isPastDate = dayjs(date).isBefore(dayjs());
    setSelectedDate(date);
    setSelectedLoadScheduleDayId(Number(loadScheduleDay.id));
    if (isPastDate) {
      setIsDayViewModalOpen(true);
    } else {
      setIsDayPlanSheetOpen(true);
    }
  };

  const handleSaveTimeSlots = () => {
    setIsDayPlanSheetOpen(false);
  };

  const handleDateChange = (date: dayjs.Dayjs) => {
    setCurrentDate(date);
  };

  if (loadScheduledDaysLoading) {
    return (
      <RootLayout pageTitle="Consumer" navbarExtra={<GeneratorFilters />}>
        <PageLoader />
      </RootLayout>
    );
  }

  const tabItems = [
    {
      key: "1",
      label: "Calendar",
      children: (
        <CalendarPlan
          loadScheduledDays={loadScheduledDays}
          onDayClick={handleDayClick}
          currentDate={currentDate}
          onDateChange={handleDateChange}
          description="Click on any day to view or edit the daily plan"
        />
      ),
    },
    {
      key: "2",
      label: "Table",
      children: (
        <TablePlan
          loadScheduledDays={loadScheduledDays}
          onDayClick={handleDayClick}
          currentDate={currentDate}
        />
      ),
    },
    {
      key: "3",
      label: "History",
      children: <AuditHistoryTab />,
    },
  ];

  return (
    <RootLayout pageTitle="Consumer" navbarExtra={<GeneratorFilters />}>
      <div className="p-6">
        {!hasSelection ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
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
          <Tabs items={tabItems} />
        )}
      </div>

      <DayViewModal
        loadScheduleDayId={selectedLoadScheduleDayId}
        open={isDayViewModalOpen}
        onOpenChange={setIsDayViewModalOpen}
      />

      <DayPlanSheet
        date={selectedDate}
        loadScheduleDayId={selectedLoadScheduleDayId}
        open={isDayPlanSheetOpen}
        onOpenChange={setIsDayPlanSheetOpen}
        onSave={handleSaveTimeSlots}
      />
    </RootLayout>
  );
};

export default Consumer;

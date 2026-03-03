import { useMemo, useState } from "react";
import { Tabs, message } from "antd";
import RootLayout from "@/common/layouts/root-layout";
import CalendarPlan from "./components/CalendarPlan";
import TablePlan from "./components/TablePlan";
import DayPlanSheet from "./components/DayPlanSheet";
import { TimeSlot } from "@/common/utils/data/types";
import { useQuery } from "@apollo/client";
import { GET_LOAD_SCHEDULED_DAYS } from "@/common/graphql/consumer.graphql";
import { GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables, LoadScheduleDaySortColumn, SortDirection } from "@/generated/graphql";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import PlantSelector from "@/common/components/plant-selector";

const presentDate = dayjs();

const Consumer = () => {
  const router = useRouter();
  const plantId = (router.query.plantId as string) || "1";
  const [currentDate, setCurrentDate] = useState<dayjs.Dayjs>(presentDate);

  const { data: loadScheduledDaysData, loading: loadScheduledDaysLoading } = useQuery<GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables>(GET_LOAD_SCHEDULED_DAYS, {
    variables: {
      filters: {
        parkIds: [plantId],
        dateRange: {
          from: currentDate.startOf("month").toISOString(),
          to: currentDate.endOf("month").toISOString(),
        }
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
    },
    skip: !plantId,
  });
  const loadScheduledDays = useMemo(() => loadScheduledDaysData?.loadScheduleDays?.data ?? [], [loadScheduledDaysData]);

  const [isDayPlanSheetOpen, setIsDayPlanSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayPlanSheetOpen(true);
  };

  const handleSaveTimeSlots = (date: string, timeSlots: TimeSlot[]) => {
    message.success(`Saved plan for ${date} with ${timeSlots.length} time slots`);
    setIsDayPlanSheetOpen(false);
  };

  const initialTimeSlots = useMemo((): TimeSlot[] | undefined => {
    if (!selectedDate) return undefined;
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === selectedDate);
    if (!loadScheduleDay?.loadSchedules) return undefined;

    return loadScheduleDay.loadSchedules.map((schedule) => ({
      time: schedule.startTime || '',
      mw: schedule.load ?? null,
      deviation: schedule.factory?.thresholdPercentage ?? null,
    }));
  }, [selectedDate, loadScheduledDays]);

  const yesterdayTimeSlots = useMemo((): TimeSlot[] | undefined => {
    if (!selectedDate) return undefined;
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === selectedDate);
    if (!loadScheduleDay?.loadSchedules) return undefined;

    return loadScheduleDay.loadSchedules.map((schedule) => ({
      time: schedule.startTime || '',
      mw: schedule.pastAverageLoad ?? null,
      deviation: schedule.factory?.thresholdPercentage ?? null,
    }));
  }, [selectedDate, loadScheduledDays]);

  const loadScheduleIds = useMemo((): string[] | undefined => {
    if (!selectedDate) return undefined;
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === selectedDate);
    if (!loadScheduleDay?.loadSchedules) return undefined;
    return loadScheduleDay.loadSchedules.map((schedule) => schedule.id);
  }, [selectedDate, loadScheduledDays]);

  const handleDateChange = (date: dayjs.Dayjs) => {
    setCurrentDate(date);
  };

  if (loadScheduledDaysLoading) {
    return (
      <RootLayout pageTitle="Consumer" navbarExtra={<PlantSelector />}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RootLayout>
    );
  }

  const tabItems = [
    {
      key: "1",
      label: "Calendar",
      children: (
        <CalendarPlan
          plantId={plantId}
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
          plantId={plantId}
          loadScheduledDays={loadScheduledDays}
          onDayClick={handleDayClick}
        />
      ),
    },
  ];

  return (
    <RootLayout pageTitle="Consumer" navbarExtra={<PlantSelector />}>
      <div className="p-6">
        <Tabs items={tabItems} />
      </div>

      <DayPlanSheet
        date={selectedDate}
        open={isDayPlanSheetOpen}
        onOpenChange={setIsDayPlanSheetOpen}
        onSave={handleSaveTimeSlots}
        initialData={initialTimeSlots}
        yesterdayData={yesterdayTimeSlots}
        loadScheduleIds={loadScheduleIds}
        plantId={plantId}
      />
    </RootLayout>
  );
};

export default Consumer;

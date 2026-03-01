import { useState } from "react";
import { Tabs } from "antd";
import RootLayout from "@/common/layouts/root-layout";
import CalendarPlan from "./components/CalendarPlan";
import TablePlan from "./components/TablePlan";
import DayPlanSheet from "./components/DayPlanSheet";

interface TimeSlot {
  time: string;
  mw: number | null;
}

const Consumer = () => {
  const [isDayPlanSheetOpen, setIsDayPlanSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayPlanSheetOpen(true);
  };

  const handleSaveTimeSlots = (date: string, timeSlots: TimeSlot[]) => {
    // TODO: Implement save logic with backend API
    // eslint-disable-next-line no-console
    console.log("Saving plan for", date, "with", timeSlots.length, "time slots");
    setIsDayPlanSheetOpen(false);
  };

  const tabItems = [
    {
      key: "1",
      label: "Calendar",
      children: <CalendarPlan onDayClick={handleDayClick} />,
    },
    {
      key: "2",
      label: "Table",
      children: <TablePlan />,
    },
  ];

  return (
    <RootLayout pageTitle="Consumer">
      <div className="p-6">
        <Tabs items={tabItems} />
      </div>

      <DayPlanSheet
        date={selectedDate}
        open={isDayPlanSheetOpen}
        onOpenChange={setIsDayPlanSheetOpen}
        onSave={handleSaveTimeSlots}
      />
    </RootLayout>
  );
};

export default Consumer;

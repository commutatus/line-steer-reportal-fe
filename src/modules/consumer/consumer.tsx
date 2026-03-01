import { useState, useEffect } from "react";
import { Tabs, message } from "antd";
import RootLayout from "@/common/layouts/root-layout";
import CalendarPlan from "./components/CalendarPlan";
import TablePlan from "./components/TablePlan";
import DayPlanSheet from "./components/DayPlanSheet";
import { TimeSlot } from "@/common/utils/data/types";
import { initializeMockData, savePlanData } from "@/common/utils/data/mockData";

const Consumer = () => {
  // const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  // const [allPlans, setAllPlans] = useState<Record<string, DailyPlan[]>>({});
  const [allPlanData, setAllPlanData] = useState<Record<string, Record<string, TimeSlot[]>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isDayPlanSheetOpen, setIsDayPlanSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const { plants: loadedPlants, allPlanData: loadedPlanData } = 
        initializeMockData(false);
      // setPlants(loadedPlants);
      // setAllPlans(loadedPlans);
      setAllPlanData(loadedPlanData);
      if (loadedPlants.length > 0) {
        setSelectedPlantId(loadedPlants[0].id);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayPlanSheetOpen(true);
  };

  const handleSaveTimeSlots = (date: string, timeSlots: TimeSlot[]) => {
    if (!selectedPlantId) return;
    const updatedPlanData = { ...allPlanData };
    const updatedPlans = {};
    savePlanData(selectedPlantId, date, timeSlots, updatedPlanData, updatedPlans);
    setAllPlanData(updatedPlanData);
    message.success(`Saved plan for ${date}`);
    setIsDayPlanSheetOpen(false);
  };

  const getInitialTimeSlots = (): TimeSlot[] | undefined => {
    if (!selectedPlantId || !selectedDate) return undefined;
    return allPlanData[selectedPlantId]?.[selectedDate];
  };

  if (isLoading) {
    return (
      <RootLayout pageTitle="Consumer">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RootLayout>
    );
  }

  const tabItems = selectedPlantId
    ? [
        {
          key: "1",
          label: "Calendar",
          children: (
            <CalendarPlan
              plantId={selectedPlantId}
              allPlanData={allPlanData}
              onDayClick={handleDayClick}
            />
          ),
        },
        {
          key: "2",
          label: "Table",
          children: (
            <TablePlan
              plantId={selectedPlantId}
              allPlanData={allPlanData}
              onDayClick={handleDayClick}
            />
          ),
        },
      ]
    : [];

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
        initialData={getInitialTimeSlots()}
      />
    </RootLayout>
  );
};

export default Consumer;

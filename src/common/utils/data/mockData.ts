import { Plant, DailyPlan, TimeSlot } from './types';

// Calculate total MW for a day (sum of all 96 time slots)
export const calculateDayTotalMW = (timeSlots: TimeSlot[]): number => {
  return timeSlots.reduce((total, slot) => total + (slot.mw || 0), 0);
};

// Derive visual fill status from time slot data
export type FillStatus = 'empty' | 'in_progress' | 'complete';

export const getFillStatus = (timeSlots: TimeSlot[] | undefined): FillStatus => {
  if (!timeSlots || timeSlots.length === 0) return 'empty';
  const filledCount = timeSlots.filter(s => s.mw !== null && s.mw !== undefined).length;
  if (filledCount === 0) return 'empty';
  if (filledCount === 96) return 'complete';
  return 'in_progress';
};

// Default plants
export const DEFAULT_PLANTS: Plant[] = [
  {
    id: 'plant-1',
    name: 'Awesome Steel Plant',
    location: 'Hoskote',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'plant-2',
    name: 'Less Awesome Steel Plant',
    location: 'Hoskote',
    createdAt: new Date('2024-02-01'),
  },
];

// Generate random MW value between min and max
const randomMW = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Generate time slots with realistic industrial consumption pattern
const generateTimeSlots = (baseLoad: number, peakHours: number[] = [9, 10, 11, 14, 15, 16]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Vary load based on time of day
      let mw: number;
      if (hour >= 0 && hour < 6) {
        // Night shift - reduced load
        mw = randomMW(baseLoad * 0.4, baseLoad * 0.6);
      } else if (peakHours.includes(hour)) {
        // Peak production hours
        mw = randomMW(baseLoad * 0.9, baseLoad * 1.1);
      } else if (hour >= 6 && hour < 22) {
        // Regular working hours
        mw = randomMW(baseLoad * 0.7, baseLoad * 0.9);
      } else {
        // Evening wind-down
        mw = randomMW(baseLoad * 0.5, baseLoad * 0.7);
      }
      
      slots.push({ time, mw, deviation: null });
    }
  }
  return slots;
};

// Pre-filled plans for current month (15 days)
export const generateMockPlansWithData = (plantId: string): { plans: DailyPlan[], planData: Record<string, TimeSlot[]> } => {
  const plans: DailyPlan[] = [];
  const planData: Record<string, TimeSlot[]> = {};
  
  // Base load depends on plant
  const baseLoad = plantId === 'plant-1' ? 4.5 : 3.2; // MW
  
  // Use current year and month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  
  for (let day = 1; day <= 15; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    
    // First 10 days are planned, rest are todo
    let status: 'todo' | 'planned';
    if (day <= 10) {
      status = 'planned';
    } else {
      status = 'todo';
    }
    
    plans.push({
      id: `plan-${plantId}-${day}`,
      plantId,
      date: dateStr,
      status,
    });
    
    // Generate time slot data for each day
    planData[dateStr] = generateTimeSlots(baseLoad);
  }
  
  return { plans, planData };
};

// Storage keys
export const STORAGE_KEYS = {
  PLANTS: 'consumer_plants',
  PLAN_DATA: 'consumer_plan_data',
} as const;

// Initialize mock data - always ensures default plants exist
export const initializeMockData = (forceReset: boolean = false): { plants: Plant[], allPlans: Record<string, DailyPlan[]>, allPlanData: Record<string, Record<string, TimeSlot[]>> } => {
  const savedPlants = localStorage.getItem(STORAGE_KEYS.PLANTS);
  const savedPlanData = localStorage.getItem(STORAGE_KEYS.PLAN_DATA);
  
  let plants: Plant[];
  let allPlans: Record<string, DailyPlan[]> = {};
  let allPlanData: Record<string, Record<string, TimeSlot[]>> = {};
  
  // Check if we need to initialize (no data or force reset)
  const needsInit = !savedPlants || forceReset;
  
  if (needsInit) {
    // Initialize with default mock data
    plants = DEFAULT_PLANTS;
    
    DEFAULT_PLANTS.forEach(plant => {
      const { plans, planData } = generateMockPlansWithData(plant.id);
      allPlans[plant.id] = plans;
      allPlanData[plant.id] = planData;
    });
    
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
    localStorage.setItem(STORAGE_KEYS.PLAN_DATA, JSON.stringify({ allPlans, allPlanData }));
  } else {
    plants = JSON.parse(savedPlants);
    
    if (savedPlanData) {
      const parsed = JSON.parse(savedPlanData);
      allPlans = parsed.allPlans || {};
      allPlanData = parsed.allPlanData || {};
    }
    
    // Ensure all plants have plan data
    plants.forEach(plant => {
      if (!allPlans[plant.id]) {
        const { plans, planData } = generateMockPlansWithData(plant.id);
        allPlans[plant.id] = plans;
        allPlanData[plant.id] = planData;
      }
    });
  }
  
  return { plants, allPlans, allPlanData };
};

// Update plan status
export const updatePlanStatus = (
  plantId: string,
  date: string,
  newStatus: 'todo' | 'planned'
): void => {
  const savedPlanData = localStorage.getItem(STORAGE_KEYS.PLAN_DATA);
  if (!savedPlanData) return;

  const parsed = JSON.parse(savedPlanData);
  const allPlans = parsed.allPlans || {};
  const allPlanData = parsed.allPlanData || {};

  if (allPlans[plantId]) {
    const planIndex = allPlans[plantId].findIndex((p: DailyPlan) => p.date === date);
    if (planIndex >= 0) {
      allPlans[plantId][planIndex].status = newStatus;
      localStorage.setItem(STORAGE_KEYS.PLAN_DATA, JSON.stringify({ allPlans, allPlanData }));
    }
  }
};

// Save plan data for a specific date
export const savePlanData = (
  plantId: string,
  date: string,
  timeSlots: TimeSlot[],
  allPlanData: Record<string, Record<string, TimeSlot[]>>,
  allPlans: Record<string, DailyPlan[]>
): void => {
  // Update the time slots
  if (!allPlanData[plantId]) {
    allPlanData[plantId] = {};
  }
  allPlanData[plantId][date] = timeSlots;
  
  // Update plan status to 'planned' if it was 'todo'
  if (allPlans[plantId]) {
    const planIndex = allPlans[plantId].findIndex(p => p.date === date);
    if (planIndex >= 0 && allPlans[plantId][planIndex].status === 'todo') {
      allPlans[plantId][planIndex].status = 'planned';
    } else if (planIndex < 0) {
      // Create new plan if doesn't exist
      allPlans[plantId].push({
        id: `plan-${plantId}-${date}`,
        plantId,
        date,
        status: 'planned',
      });
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.PLAN_DATA, JSON.stringify({ allPlans, allPlanData }));
};

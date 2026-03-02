export interface Plant {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
}

export interface TimeSlot {
  time: string; // HH:mm format
  mw: number | null;
  deviation: number | null;
}

export interface DailyPlan {
  id: string;
  plantId: string;
  date: string; // YYYY-MM-DD format
  status: 'todo' | 'planned';
}

export interface DailyPlanData extends DailyPlan {
  timeSlots: TimeSlot[];
}

export type PlanStatus = 'todo' | 'planned';

import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LoadScheduleDay } from "../types/load-schedule";
import { PlanStatus } from "../constants/plan-status";

dayjs.extend(timezone);
dayjs.extend(utc);


export const convertToUTCHoursFormat = (date: string) => {
  return dayjs(date).utc().format("HH:mm");
};

export const getPlanStatusForDate = (date: Dayjs, loadScheduledDays: LoadScheduleDay[]): PlanStatus => {
  const dateStr = date.format("YYYY-MM-DD");
  const loadScheduleDay = loadScheduledDays.find((day) => day.date === dateStr);
  if (!loadScheduleDay?.status) {
    return PlanStatus.NotAvailable;
  }
  return loadScheduleDay.status;
};

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);


export const convertToUTCHoursFormat = (date: string) => {
  return dayjs(date).utc().format("HH:mm");
};

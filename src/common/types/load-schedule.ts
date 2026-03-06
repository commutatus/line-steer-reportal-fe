import { GetLoadScheduleDaysQuery, GetLoadScheduledDayDetailsQuery } from "@/generated/graphql";

export type LoadScheduleDay = NonNullable<GetLoadScheduleDaysQuery["loadScheduleDays"]>["data"][number];

export type LoadScheduleDayDetails = NonNullable<GetLoadScheduledDayDetailsQuery["loadScheduleDays"]>["data"][number];

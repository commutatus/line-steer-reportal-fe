import { GetLoadScheduleDaysQuery } from "@/generated/graphql";

export type LoadScheduleDay = NonNullable<GetLoadScheduleDaysQuery["loadScheduleDays"]>["data"][number];
import { GetLoadScheduleDaysQuery } from "@/generated/graphql";

export type LoadSchedule = NonNullable<GetLoadScheduleDaysQuery["loadScheduleDays"]>["data"][number];

import { faCheck, faPlus, faSpinner } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { LoadScheduleDayStatusEnum } from "@/generated/graphql";

export const fillConfig: Record<
  LoadScheduleDayStatusEnum,
  { color: string; label: string; bgClass: string; icon: IconDefinition }
> = {
  [LoadScheduleDayStatusEnum.Pending]: {
    color: "var(--color-gray-400)", 
    label: "To Do", 
    bgClass: "bg-gray-200", 
    icon: faPlus,
  },
  [LoadScheduleDayStatusEnum.InProgress]: {
    color: "var(--color-amber-600)",
    label: "In Progress",
    bgClass: "bg-yellow-100",
    icon: faSpinner,
  },
  [LoadScheduleDayStatusEnum.Ready]: {
    color: "var(--color-green-600)",
    label: "Planned",
    bgClass: "bg-green-200",
    icon: faCheck,
  },
};

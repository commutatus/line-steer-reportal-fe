import { faBan, faCheck, faPlus, faSpinner } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { LoadScheduleDayStatusEnum } from "@/generated/graphql";

export const PlanStatus = {
  Pending: LoadScheduleDayStatusEnum.Pending,
  InProgress: LoadScheduleDayStatusEnum.InProgress,
  Ready: LoadScheduleDayStatusEnum.Ready,
  NotAvailable: "not_available",
} as const;

export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export const fillConfig: Record<
  PlanStatus,
  { color: string; label: string; bgClass: string; icon: IconDefinition }
> = {
  [PlanStatus.Pending]: {
    color: "var(--color-gray-400)",
    label: "Pending",
    bgClass: "bg-gray-200",
    icon: faPlus,
  },
  [PlanStatus.InProgress]: {
    color: "var(--color-amber-600)",
    label: "In Progress",
    bgClass: "bg-yellow-100",
    icon: faSpinner,
  },
  [PlanStatus.Ready]: {
    color: "var(--color-green-600)",
    label: "Planned",
    bgClass: "bg-green-200",
    icon: faCheck,
  },
  [PlanStatus.NotAvailable]: {
    color: "var(--color-red-500)",
    label: "Not Available",
    bgClass: "bg-red-50",
    icon: faBan,
  },
};

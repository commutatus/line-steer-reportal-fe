import { FillStatus } from "@/common/utils/data/mockData";
import { faCheck, faPlus, faSpinner } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export const fillConfig: Record<
  FillStatus,
  { color: string; label: string; bgClass: string; icon: IconDefinition }
> = {
  empty: {
    color: "var(--color-gray-400)", 
    label: "To Do", 
    bgClass: "bg-gray-200", 
    icon: faPlus,
  },
  in_progress: {
    color: "var(--color-amber-600)",
    label: "In Progress",
    bgClass: "bg-yellow-100",
    icon: faSpinner,
  },
  complete: {
    color: "var(--color-green-600)",
    label: "Planned",
    bgClass: "bg-green-200",
    icon: faCheck,
  },
};

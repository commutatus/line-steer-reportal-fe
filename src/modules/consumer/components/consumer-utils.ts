import { FillStatus } from "@/common/utils/data/mockData";
import { faCheck, faPlus, faSpinner } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export const fillConfig: Record<
  FillStatus,
  { color: string; label: string; bgClass: string; icon: IconDefinition }
> = {
  empty: {
    color: "#9ca3af", 
    label: "To Do", 
    bgClass: "bg-gray-200", 
    icon: faPlus,
  },
  in_progress: {
    color: "#d97706",
    label: "In Progress",
    bgClass: "bg-yellow-100",
    icon: faSpinner,
  },
  complete: {
    color: "#16a34a",
    label: "Planned",
    bgClass: "bg-green-200",
    icon: faCheck,
  },
};

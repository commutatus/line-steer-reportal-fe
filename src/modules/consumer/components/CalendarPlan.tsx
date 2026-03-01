import { Calendar } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { PlusOutlined, SyncOutlined, CheckCircleOutlined } from "@ant-design/icons";
import styles from "./calendar-plan.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

interface CalendarPlanProps {
  onDayClick?: (date: string) => void;
}

type FillStatus = "empty" | "in_progress" | "complete";

const fillConfig: Record<
  FillStatus,
  { color: string; text: string; bgClass: string; icon: typeof PlusOutlined }
> = {
  empty: { color: "#9ca3af", text: "To Do", bgClass: "bg-gray-200", icon: PlusOutlined },
  in_progress: {
    color: "#d97706",
    text: "In Progress",
    bgClass: "bg-yellow-100",
    icon: SyncOutlined,
  },
  complete: {
    color: "#16a34a",
    text: "Planned",
    bgClass: "bg-green-200",
    icon: CheckCircleOutlined,
  },
};

const CalendarPlan = (props: CalendarPlanProps) => {
  const { onDayClick } = props;

  const getStatusForDate = (): FillStatus => {
    return "empty";
  };

  const dateCellRender = (date: Dayjs) => {
    const status = getStatusForDate();
    const isCurrentMonth = date.month() === dayjs().month();
    if (!isCurrentMonth) return null;

    const config = fillConfig[status];
    const Icon = config.icon;
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="text-2xl" style={{ color: config.color }} />
      </div>
    );
  };

  const handleSelect = (date: Dayjs) => {
    if (onDayClick) {
      onDayClick(date.format("YYYY-MM-DD"));
    }
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] shadow-sm bg-white">
      <div className="p-4 border-b border-[#e2e8f0]">
        <p className="text-muted-foreground text-sm">
          Click on any day to view or edit the daily plan
        </p>
        <div className="flex gap-6 mt-3 flex-wrap">
          {Object.entries(fillConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center ${config.bgClass}`}>
                  <Icon style={{ color: config.color }} className="text-sm" />
                </div>
                <span className="text-muted-foreground text-sm">{config.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <Calendar
          fullscreen={true}
          mode="month"
          cellRender={(date, info) => {
            if (info.type === "date") {
              const status = getStatusForDate();
              const isCurrentMonth = date.month() === dayjs().month();
              const bgClass = isCurrentMonth ? fillConfig[status].bgClass : "";
              return (
                <div className={`absolute inset-0 ${bgClass}`}>{dateCellRender(date)}</div>
              );
            }
            return info.originNode;
          }}
          onSelect={handleSelect}
          className={cx("consumerCalendarFullscreen")}
        />
      </div>
    </div>
  );
};

export default CalendarPlan;

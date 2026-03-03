import { Calendar } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import styles from "./calendar-plan.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fillConfig } from "@/modules/consumer/consumer-utils";
import { LoadScheduleDay } from "@/modules/consumer/consumer.types";
import { LoadScheduleDayStatusEnum } from "@/generated/graphql";

const cx = classNames.bind(styles);

interface CalendarPlanProps {
  plantId: string;
  loadScheduledDays: LoadScheduleDay[];
  onDayClick?: (date: string) => void;
  currentDate: dayjs.Dayjs;
  onDateChange?: (date: dayjs.Dayjs) => void;
  description?: string;
}

const CalendarPlan = (props: CalendarPlanProps) => {
  const { loadScheduledDays, onDayClick, currentDate, onDateChange, description } = props;

  const getStatusForDate = (date: Dayjs): LoadScheduleDayStatusEnum => {
    const dateStr = date.format("YYYY-MM-DD");
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === dateStr);
    return loadScheduleDay?.status ?? LoadScheduleDayStatusEnum.Pending;
  };

  const dateCellRender = (date: Dayjs) => {
    const status = getStatusForDate(date);
    const isCurrentMonth = date.month() === dayjs().month();
    if (!isCurrentMonth) return null;

    const config = fillConfig[status];
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <FontAwesomeIcon
          icon={config.icon}
          className="text-2xl"
          style={{ color: config.color }}
        />
      </div>
    );
  };

  const handleSelect = (date: Dayjs) => {
    if (onDayClick) {
      onDayClick(date.format("YYYY-MM-DD"));
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="p-4 border-b border-slate-200">
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
        <div className="flex gap-6 mt-3 flex-wrap">
          {Object.entries(fillConfig).map(([status, config]) => {
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cx("w-6 h-6 flex items-center justify-center", config.bgClass)}>
                  <FontAwesomeIcon
                    icon={config.icon}
                    style={{ color: config.color }}
                  />
                </div>
                <span className="text-muted-foreground text-sm">{config.label}</span>
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
              const status = getStatusForDate(date);
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
          value={currentDate}
          onChange={onDateChange}
        />
      </div>
    </div>
  );
};

export default CalendarPlan;

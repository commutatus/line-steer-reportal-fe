import { Calendar } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import styles from "./calendar-plan.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fillConfig, PlanStatus } from "@/common/constants/plan-status";
import { LoadScheduleDay } from "@/common/types/load-schedule";
import { SelectInfo } from "antd/es/calendar/generateCalendar";

const cx = classNames.bind(styles);

interface CalendarPlanProps {
  loadScheduledDays: LoadScheduleDay[];
  onDayClick?: (date: string) => void;
  currentDate: dayjs.Dayjs;
  onDateChange?: (date: dayjs.Dayjs) => void;
  description?: string;
}

const CalendarPlan = (props: CalendarPlanProps) => {
  const { loadScheduledDays, onDayClick, currentDate, onDateChange, description } = props;

  const getPlanStatusForDate = (date: Dayjs): PlanStatus => {
    const today = dayjs();
    if (date.isBefore(today)) {
      return PlanStatus.PastDay;
    }
    const dateStr = date.format("YYYY-MM-DD");
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === dateStr);
    if (!loadScheduleDay?.status) {
      return PlanStatus.NotAvailable;
    }
    return loadScheduleDay.status;
  };

  const dateCellRender = (date: Dayjs) => {
    const status = getPlanStatusForDate(date);
    const isSelectedMonth = date.month() === currentDate.month();
    if (!isSelectedMonth) return null;

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

  const handleSelect = (date: Dayjs, selectInfo: SelectInfo) => {
    if (selectInfo.source === "date" && onDayClick) {
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
              const status = getPlanStatusForDate(date);
              const isSelectedMonth = date.month() === currentDate.month();
              const bgClass = isSelectedMonth ? fillConfig[status].bgClass : "";
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

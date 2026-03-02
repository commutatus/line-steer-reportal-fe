import dayjs from "dayjs";
import { Table, Tag } from "antd";
import { fillConfig } from "@/modules/consumer/consumer-utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadScheduleDay } from "../consumer.types";
import { LoadScheduleDayStatusEnum } from "@/generated/graphql";

interface TablePlanProps {
  plantId: string;
  loadScheduledDays: LoadScheduleDay[];
  onDayClick?: (date: string) => void;
}

const TablePlan = (props: TablePlanProps) => {
  const { loadScheduledDays, onDayClick } = props;
  const now = dayjs();
  const daysInMonth = now.daysInMonth();

  const rows = Array.from({ length: daysInMonth }, (_, i) => {
    const date = now.date(i + 1);
    const dateStr = date.format("YYYY-MM-DD");
    const loadScheduleDay = loadScheduledDays.find((day) => day.date === dateStr);
    const totalMW = loadScheduleDay?.loadSchedules?.reduce((sum, schedule) => sum + (schedule.load || 0), 0) || 0;
    const fillStatus = loadScheduleDay?.status ?? LoadScheduleDayStatusEnum.Pending;
    return {
      key: dateStr,
      date: dateStr,
      dayOfWeek: date.format("ddd"),
      fillStatus,
      totalMW,
    };
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span className="font-medium">{dayjs(date).format("DD MMM YYYY")}</span>
      ),
    },
    {
      title: "Day",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
    },
    {
      title: "Status",
      dataIndex: "fillStatus",
      key: "fillStatus",
      render: (status: LoadScheduleDayStatusEnum) => {
        const config = fillConfig[status];
        return (
          <Tag color={config.color}>
            <FontAwesomeIcon icon={config.icon} /> {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Total MW",
      dataIndex: "totalMW",
      key: "totalMW",
      align: "right" as const,
      render: (val: number) => (
        <span className="font-mono">{val > 0 ? val.toFixed(2) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="p-4 border-b border-slate-200">
        <p className="text-slate-500 text-sm">
          Click on any row to view or edit the daily plan
        </p>
      </div>
      <Table
        dataSource={rows}
        columns={columns}
        pagination={false}
        size="middle"
        onRow={(record) => ({
          onClick: () => onDayClick?.(record.date),
          className: "cursor-pointer",
        })}
      />
    </div>
  );
};

export default TablePlan;

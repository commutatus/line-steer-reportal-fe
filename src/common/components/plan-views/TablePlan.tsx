import dayjs, { Dayjs } from "dayjs";
import { Empty, Table, Tag } from "antd";
import { fillConfig, PlanStatus } from "@/common/constants/plan-status";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadScheduleDay } from "@/common/types/load-schedule";

interface TablePlanProps {
  loadScheduledDays: LoadScheduleDay[];
  onDayClick?: (date: string) => void;
  currentDate: Dayjs;
}

const TablePlan = (props: TablePlanProps) => {
  const { loadScheduledDays, onDayClick, currentDate } = props;
  const dataSource = loadScheduledDays.map((loadScheduledDay) => {
    const totalMW = loadScheduledDay.loadSchedules?.reduce((sum, schedule) => sum + (schedule.load || 0), 0) || 0;
    const dayjsDate = dayjs(loadScheduledDay.date);

    const fillStatus = loadScheduledDay.status ?? PlanStatus.NotAvailable;
    return {
      key: loadScheduledDay.id,
      date: loadScheduledDay.date,
      dayOfWeek: dayjsDate.format("ddd"),
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
      render: (status: PlanStatus) => {
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
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="middle"
        onRow={(record) => ({
          onClick: () => onDayClick?.(record.date),
          className: "cursor-pointer",
        })}
        locale={{
          emptyText: <Empty description={`Loadschedule not available for ${currentDate.format("MMM YYYY")}`} />
        }}
      />
    </div>
  );
};

export default TablePlan;

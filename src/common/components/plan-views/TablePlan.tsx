import dayjs, { Dayjs } from "dayjs";
import { Empty, Table } from "antd";
import { PlanStatus } from "@/common/constants/plan-status";
import { LoadScheduleDay } from "@/common/types/load-schedule";
import StatusTag from "@/common/status-tag/status-tag";

interface TablePlanProps {
  loadScheduledDays: LoadScheduleDay[];
  onDayClick?: (date: string) => void;
  currentDate: Dayjs;
}
const presentDate = dayjs();

const TablePlan = (props: TablePlanProps) => {
  const { loadScheduledDays, onDayClick, currentDate } = props;
  const dataSource = loadScheduledDays.map((loadScheduledDay) => {
    const dayjsDate = dayjs(loadScheduledDay.date);

    let fillStatus: PlanStatus = loadScheduledDay.status ?? PlanStatus.NotAvailable;
    if (dayjsDate.isBefore(presentDate)) {
      fillStatus = PlanStatus.PastDay;
    }

    return {
      key: loadScheduledDay.id,
      date: loadScheduledDay.date,
      dayOfWeek: dayjsDate.format("ddd"),
      fillStatus,
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
        return <StatusTag status={status} />;
      },
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

import dayjs from "dayjs";
import { Table, Tag } from "antd";
import { PlusOutlined, SyncOutlined, CheckCircleOutlined } from "@ant-design/icons";

type FillStatus = "empty" | "in_progress" | "complete";

interface TimeSlot {
  time: string;
  mw: number | null;
}

interface TablePlanProps {
  onDayClick?: (date: string) => void;
}

const getFillStatus = (timeSlots?: TimeSlot[]): FillStatus => {
  if (!timeSlots || timeSlots.length === 0) return "empty";
  const filledCount = timeSlots.filter((slot) => slot.mw !== null && slot.mw > 0).length;
  if (filledCount === 0) return "empty";
  if (filledCount === timeSlots.length) return "complete";
  return "in_progress";
};

const calculateDayTotalMW = (timeSlots: TimeSlot[]): number => {
  return timeSlots.reduce((sum, slot) => sum + (slot.mw || 0), 0);
};

const fillStatusConfig: Record<
  FillStatus,
  { color: string; label: string; icon: React.ReactNode }
> = {
  empty: { color: "default", label: "To Do", icon: <PlusOutlined /> },
  in_progress: { color: "warning", label: "In Progress", icon: <SyncOutlined /> },
  complete: { color: "success", label: "Planned", icon: <CheckCircleOutlined /> },
};

const TablePlan = (props: TablePlanProps) => {
  const { onDayClick } = props;
  const now = dayjs();
  const daysInMonth = now.daysInMonth();

  const allPlanData: Record<string, Record<string, TimeSlot[]>> = {};

  const rows = Array.from({ length: daysInMonth }, (_, i) => {
    const date = now.date(i + 1);
    const dateStr = date.format("YYYY-MM-DD");
    const timeSlots = allPlanData[""]?.[dateStr];
    const totalMW = calculateDayTotalMW(timeSlots || []);
    const fillStatus = getFillStatus(timeSlots);
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
      render: (status: FillStatus) => {
        const config = fillStatusConfig[status];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
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
    <div className="rounded-xl border border-[#e2e8f0] shadow-sm bg-white">
      <div className="p-4 border-b border-[#e2e8f0]">
        <p className="text-[hsl(215.4_16.3%_46.9%)] text-sm">
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
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default TablePlan;

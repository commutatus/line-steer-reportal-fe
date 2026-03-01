import { useState, useMemo, useEffect } from "react";
import { Drawer, Button, Space, InputNumber, Table } from "antd";
import { TimeSlot } from "@/common/utils/data/types";

interface DayPlanSheetProps {
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (date: string, timeSlots: TimeSlot[]) => void;
  initialData?: TimeSlot[];
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push({ time, mw: null });
    }
  }
  return slots;
};

interface HourRow {
  key: number;
  hour: string;
  q0: number | null;
  q1: number | null;
  q2: number | null;
  q3: number | null;
}

const DayPlanSheet = (props: DayPlanSheetProps) => {
  const { date, open, onOpenChange, onSave, initialData } = props;
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() =>
    initialData || generateTimeSlots()
  );

  useEffect(() => {
    if (date) {
      setTimeSlots(initialData || generateTimeSlots());
    }
  }, [date, initialData]);

  const handleMwChange = (index: number, value: number | null) => {
    if (value !== null && value < 0) return;
    setTimeSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], mw: value };
      return updated;
    });
  };

  const handleSave = () => {
    if (date) {
      onSave(date, timeSlots);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTimeSlots(initialData || generateTimeSlots());
    onOpenChange(false);
  };

  const formattedDate = useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  const dataSource: HourRow[] = useMemo(() => {
    return Array.from({ length: 24 }, (_, h) => {
      const base = h * 4;
      return {
        key: h,
        hour: `${h.toString().padStart(2, "0")}:00`,
        q0: timeSlots[base]?.mw ?? null,
        q1: timeSlots[base + 1]?.mw ?? null,
        q2: timeSlots[base + 2]?.mw ?? null,
        q3: timeSlots[base + 3]?.mw ?? null,
      };
    });
  }, [timeSlots]);

  const columns = [
    {
      title: "Hour",
      dataIndex: "hour",
      key: "hour",
      width: 80,
      fixed: "left" as const,
      render: (v: string) => <span className="font-mono text-sm font-medium">{v}</span>,
    },
    ...[0, 1, 2, 3].map((q) => ({
      title: `:${(q * 15).toString().padStart(2, "0")}`,
      dataIndex: `q${q}`,
      key: `q${q}`,
      width: 100,
      render: (_: unknown, record: HourRow) => (
        <InputNumber
          min={0}
          step={0.01}
          placeholder="0.00"
          value={record[`q${q}` as keyof HourRow] as number | null}
          onChange={(value) => handleMwChange(record.key * 4 + q, value)}
          size="small"
          className="w-full"
          inputMode="decimal"
        />
      ),
    })),
  ];

  return (
    <Drawer
      title={`Plan for ${formattedDate}`}
      open={open}
      onClose={() => onOpenChange(false)}
      size={540}
      footer={
        <Space className="w-full justify-end">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        scroll={{ y: "calc(100vh - 220px)" }}
      />
    </Drawer>
  );
};

export default DayPlanSheet;

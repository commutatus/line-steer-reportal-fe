import { useState, useMemo, useEffect } from "react";
import { Drawer, Button, Space, InputNumber, Table, message } from "antd";
import { TimeSlot } from "@/common/utils/data/types";
import { useMutation } from "@apollo/client";
import { BulkUpdateLoadSchedulesMutation, BulkUpdateLoadSchedulesMutationVariables } from "@/generated/graphql";
import PlanConfirmModal from "./PlanConfirmModal";
import ExportScheduleButton from "./ExportScheduleButton";
import { BULK_UPDATE_LOAD_SCHEDULES_MUTATION } from "@/common/graphql/consumer.graphql";

interface DayPlanSheetProps {
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (date: string, timeSlots: TimeSlot[]) => void;
  initialData?: TimeSlot[];
  averageData?: TimeSlot[];
  loadScheduleIds?: string[];
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push({ time, mw: null, deviation: null, maximumRequestLimit: null });
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
  const { date, open, onOpenChange, onSave, initialData, averageData, loadScheduleIds } = props;
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() =>
    initialData || generateTimeSlots()
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [bulkUpdateLoadSchedules, { 
    loading: bulkUpdateLoadSchedulesLoading,
  }] = useMutation<BulkUpdateLoadSchedulesMutation, BulkUpdateLoadSchedulesMutationVariables>(BULK_UPDATE_LOAD_SCHEDULES_MUTATION);
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

  const handleContinue = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!date || !loadScheduleIds || loadScheduleIds.length === 0) {
      message.error("Unable to save: missing schedule data");
      return;
    }

    try {
      const loadSchedules = timeSlots
        .map((slot, index) => ({
          id: loadScheduleIds[index],
          load: slot.mw,
          hasChanged: slot.mw !== (initialData?.[index]?.mw ?? null),
        }))
        .filter((entry) => entry.hasChanged)
        .map(({ id, load }) => ({ id, load }));

      await bulkUpdateLoadSchedules({
        variables: {
          input: {
            loadSchedules,
          },
        },
      });

      message.success(`Saved plan for ${date}`);
      onSave(date, timeSlots);
      setShowConfirm(false);
      onOpenChange(false);
    } catch {
      message.error("Failed to save plan. Please try again.");
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
      render: (v: string) => <span className="text-sm font-medium">{v}</span>,
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
    <>
      <Drawer
        title={(
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Plan for {formattedDate}</span>
            <ExportScheduleButton date={{ from: date ?? "", to: date ?? "" }} />
          </div>
        )}
        open={open}
        onClose={() => onOpenChange(false)}
        size={540}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} disabled={bulkUpdateLoadSchedulesLoading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleContinue}
              disabled={bulkUpdateLoadSchedulesLoading}
            >
              Continue
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

      {date && (
        <PlanConfirmModal
          open={showConfirm}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirm(false)}
          date={date}
          currentSlots={timeSlots}
          previousSlots={initialData}
          averageSlots={averageData}
        />
      )}
    </>
  );
};

export default DayPlanSheet;

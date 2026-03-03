import React, { useMemo } from "react";
import { Modal, Table, Tag } from "antd";
import ReactECharts from "echarts-for-react";
import { TimeSlot } from "@/common/utils/data/types";
import { convertToUTCHoursFormat } from "@/common/utils/helpers";
import classNames from "classnames";

interface PlanConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  date: string;
  currentSlots: TimeSlot[];
  previousSlots?: TimeSlot[];
  yesterdaySlots?: TimeSlot[];
}

interface ChangeRow {
  key: string;
  time: string;
  oldValue: number | null;
  newValue: number | null;
  yesterdayValue: number | null;
  deviatesFromYesterday: boolean;
  deviation: number | null;
}

const getDeviation = (newVal: number | null, yVal: number | null, deviation: number | null): boolean => {
  if (newVal === null || yVal === null || yVal === 0 || deviation === null) {
    return false;
  }
  return Math.abs(((newVal - yVal) / yVal) * 100) > deviation;
};

const PlanConfirmModal: React.FC<PlanConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  date,
  currentSlots,
  previousSlots,
  yesterdaySlots,
}) => {
  const changes: ChangeRow[] = useMemo(() => {
    const rows: ChangeRow[] = [];
    currentSlots.forEach((slot, i) => {
      const oldVal = previousSlots?.[i]?.mw ?? null;
      const newVal = slot.mw;
      const yVal = yesterdaySlots?.[i]?.mw ?? null;
      if (oldVal !== newVal) {
        rows.push({
          key: String(i),
          time: convertToUTCHoursFormat(slot.time),
          oldValue: oldVal,
          newValue: newVal,
          yesterdayValue: yVal,
          deviatesFromYesterday: getDeviation(newVal, yVal, slot.deviation),
          deviation: slot.deviation,
        });
      }
    });
    return rows;
  }, [currentSlots, previousSlots, yesterdaySlots]);

  const changeColumns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 80,
      render: (v: string, record: ChangeRow) => (
        <span
          className={classNames("text-sm", {
            "font-bold": record.deviatesFromYesterday,
          })}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Previous (MW)",
      dataIndex: "oldValue",
      key: "oldValue",
      width: 110,
      render: (v: number | null) => {
        if (v === null) {
          return <Tag>Empty</Tag>;
        }
        return <span className="text-gray-500">{v.toFixed(2)}</span>;
      },
    },
    {
      title: "New (MW)",
      dataIndex: "newValue",
      key: "newValue",
      width: 110,
      render: (v: number | null, record: ChangeRow) => {
        if (v === null) {
          return <Tag>Empty</Tag>;
        }
        const diff = record.oldValue !== null ? v - record.oldValue : null;
        return (
          <span className="font-semibold">
            {v.toFixed(2)}
            {diff !== null && (
              <span
                className={classNames("ml-1 text-xs", {
                  "text-green-600": diff > 0,
                  "text-red-600": diff < 0,
                })}
              >
                ({diff > 0 ? "+" : ""}
                {diff.toFixed(2)})
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: "Average (MW)",
      dataIndex: "yesterdayValue",
      key: "yesterdayValue",
      width: 120,
      render: (v: number | null) => (
          <span className="text-gray-500">
            {v?.toFixed(2)}
          </span>
        )
    },
    {
      title: "Deviation",
      key: "deviation",
      width: 100,
      render: (_: unknown, record: ChangeRow) => {
        if (
          record.newValue === null ||
          record.yesterdayValue === null ||
          record.yesterdayValue === 0
        ) {
          return <span className="text-gray-400">—</span>;
        }
        const pct =
          ((record.newValue - record.yesterdayValue) / record.yesterdayValue) *
          100;
        const isOver = Math.abs(pct) > (record.deviation ?? 0);
        return (
          <Tag color={isOver ? "red" : "default"}>
            {pct > 0 ? "+" : ""}
            {pct.toFixed(1)}%
          </Tag>
        );
      },
    },
  ];

  const chartOption = useMemo(() => {
    const times = currentSlots.map((s) => convertToUTCHoursFormat(s.time));
    const todayValues = currentSlots.map((s) => s.mw ?? 0);
    const yesterdayValues = yesterdaySlots
      ? yesterdaySlots.map((s) => s.mw ?? 0)
      : [];

    const markData: { coord: [number, number]; itemStyle: { color: string } }[] = [];
    if (yesterdaySlots) {
      currentSlots.forEach((slot, i) => {
        if (getDeviation(slot.mw, yesterdaySlots[i]?.mw ?? null, slot.deviation)) {
          markData.push({
            coord: [i, slot.mw ?? 0],
            itemStyle: { color: "#dc2626" },
          });
        }
      });
    }

    const series: {
      name: string;
      type: string;
      data: number[];
      smooth: boolean;
      areaStyle: { opacity: number };
      color: string;
      lineStyle?: { type: string; width: number };
      markPoint?: {
        symbol: string;
        symbolSize: number;
        data: typeof markData;
        label: { show: boolean };
      };
    }[] = [
      {
        name: "Today",
        type: "line",
        data: todayValues,
        smooth: true,
        areaStyle: { opacity: 0.2 },
        color: "#3b82f6",
        ...(markData.length > 0
          ? {
              markPoint: {
                symbol: "circle",
                symbolSize: 8,
                data: markData,
                label: { show: false },
              },
            }
          : {}),
      },
    ];

    if (yesterdaySlots && yesterdaySlots.length > 0) {
      series.push({
        name: "Average",
        type: "line",
        data: yesterdayValues,
        smooth: true,
        lineStyle: { type: "dashed", width: 2 },
        color: "#94a3b8",
        areaStyle: { opacity: 0.05 },
      });
    }

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: { dataIndex: number; marker: string; seriesName: string; value: number }[]) => {
          const idx = params[0].dataIndex;
          const time = times[idx];
          let html = `<strong>${time}</strong><br/>`;
          params.forEach((p) => {
            html += `${p.marker} ${p.seriesName}: <strong>${p.value.toFixed(2)} MW</strong><br/>`;
          });
          if (
            yesterdaySlots &&
            getDeviation(
              currentSlots[idx]?.mw ?? null,
              yesterdaySlots[idx]?.mw ?? null,
              currentSlots[idx]?.deviation ?? null,
            )
          ) {
            const yVal = yesterdaySlots[idx]?.mw ?? 0;
            const pct =
              yVal !== 0
                ? (((currentSlots[idx]?.mw ?? 0) - yVal) / yVal) * 100
                : 0;
            html += `<span style="color:#dc2626;font-weight:bold">⚠ ${pct > 0 ? "+" : ""}${pct.toFixed(1)}% from average</span>`;
          }
          return html;
        },
      },
      legend: { bottom: 0 },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisLabel: { interval: 3, rotate: 0, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "MW",
        axisLabel: { formatter: "{value}" },
      },
      series,
    };
  }, [currentSlots, yesterdaySlots]);

  const formattedDate = useMemo(() => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  const deviatingChanges = changes.filter((c) => c.deviatesFromYesterday);
  const deviationCount = deviatingChanges.length;
  const uniqueDeviationThresholds = [
    ...new Set(deviatingChanges.map((c) => c.deviation).filter((d): d is number => d !== null)),
  ].sort((a, b) => a - b);
  const deviationThresholdLabel = uniqueDeviationThresholds.length === 1
    ? `${uniqueDeviationThresholds[0]}%`
    : uniqueDeviationThresholds.length > 1
      ? `${uniqueDeviationThresholds[0]}-${uniqueDeviationThresholds[uniqueDeviationThresholds.length - 1]}%`
      : null;

  return (
    <Modal
      title={`Confirm Plan — ${formattedDate}`}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Submit"
      cancelText="Go Back"
      width={960}
      classNames={{
        body: "max-h-[75vh] overflow-auto"
      }}
      centered
    >
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2!">
            Load Profile {yesterdaySlots ? "(vs Average)" : ""}
          </h4>
          <div className="border rounded-lg p-2 bg-gray-50">
            <ReactECharts
              option={chartOption}
              style={{ height: "350px" }}
              notMerge
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2!">
            Changes Made{" "}
            <Tag color={changes.length > 0 ? "blue" : "default"}>
              {changes.length} slot{changes.length !== 1 ? "s" : ""}
            </Tag>
            {deviationCount > 0 && (
              <Tag color="red" className="ml-1">
                {deviationCount} deviate{deviationCount !== 1 ? "" : "s"} &gt;{deviationThresholdLabel}{" "}
                from average
              </Tag>
            )}
          </h4>
          {changes.length === 0 ? (
            <div className="text-gray-400 text-sm py-4 text-center">
              No changes detected
            </div>
          ) : (
            <Table
              dataSource={changes}
              columns={changeColumns}
              pagination={false}
              size="small"
              bordered
              rowClassName={(record) =>
                classNames({
                  "bg-red-50": record.deviatesFromYesterday,
                })
              }
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PlanConfirmModal;

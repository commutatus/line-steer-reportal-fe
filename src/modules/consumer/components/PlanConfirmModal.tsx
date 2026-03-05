import React, { useMemo } from "react";
import { Alert, Modal, Table, Tag } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import classNames from "classnames";
import ReactECharts from "echarts-for-react";
import { TimeSlot } from "@/common/utils/data/types";
import { convertToUTCHoursFormat } from "@/common/utils/helpers";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);


interface PlanConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  date: string;
  currentSlots: TimeSlot[];
  previousSlots?: TimeSlot[];
  averageSlots?: TimeSlot[];
}

interface ChangeRow {
  key: string;
  time: string;
  oldValue: number | null;
  newValue: number | null;
  averageValue: number | null;
  deviatesFromAverage: boolean;
  deviation: number | null;
}

const getDeviation = (newVal: number | null, avgVal: number | null, deviation: number | null): boolean => {
  if (newVal === null || avgVal === null || avgVal === 0 || deviation === null) {
    return false;
  }
  return Math.abs(((newVal - avgVal) / avgVal) * 100) > deviation;
};

const PlanConfirmModal: React.FC<PlanConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  date,
  currentSlots,
  previousSlots,
  averageSlots,
}) => {
  const changes: ChangeRow[] = useMemo(() => {
    const rows: ChangeRow[] = [];
    currentSlots.forEach((slot, i) => {
      const oldVal = previousSlots?.[i]?.mw ?? null;
      const newVal = slot.mw;
      const avgVal = averageSlots?.[i]?.mw ?? null;
      if (oldVal !== newVal) {
        rows.push({
          key: String(i),
          time: convertToUTCHoursFormat(slot.time),
          oldValue: oldVal,
          newValue: newVal,
          averageValue: avgVal,
          deviatesFromAverage: getDeviation(newVal, avgVal, slot.deviation),
          deviation: slot.deviation,
        });
      }
    });
    return rows;
  }, [currentSlots, previousSlots, averageSlots]);

  const changeColumns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 80,
      render: (v: string, record: ChangeRow) => (
        <span
          className={classNames("text-sm", {
            "font-bold": record.deviatesFromAverage,
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
      dataIndex: "averageValue",
      key: "averageValue",
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
          record.averageValue === null ||
          record.averageValue === 0
        ) {
          return <span className="text-gray-400">—</span>;
        }
        const pct =
          ((record.newValue - record.averageValue) / record.averageValue) *
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
    const averageValues = averageSlots
      ? averageSlots.map((s) => s.mw ?? 0)
      : [];
    const limitValues = currentSlots.map((s) => s.maximumRequestLimit ?? 0);
    const hasLimitData = limitValues.some((v) => v > 0);

    const markData: { coord: [number, number]; itemStyle: { color: string } }[] = [];
    if (averageSlots) {
      currentSlots.forEach((slot, i) => {
        if (getDeviation(slot.mw, averageSlots[i]?.mw ?? null, slot.deviation)) {
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
      areaStyle?: { opacity: number };
      color: string;
      lineStyle?: { type: string; width: number };
      symbol?: string | boolean;
      symbolSize?: number;
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

    if (averageSlots && averageSlots.length > 0) {
      series.push({
        name: "Average",
        type: "line",
        data: averageValues,
        smooth: true,
        lineStyle: { type: "dashed", width: 2 },
        color: "#94a3b8",
        areaStyle: { opacity: 0.05 },
      });
    }

    if (hasLimitData) {
      series.push({
        name: "Limit",
        type: "line",
        data: limitValues,
        smooth: false,
        lineStyle: { type: "dashed", width: 2 },
        color: "#f59e0b",
        symbol: "none",
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
            averageSlots &&
            getDeviation(
              currentSlots[idx]?.mw ?? null,
              averageSlots[idx]?.mw ?? null,
              currentSlots[idx]?.deviation ?? null,
            )
          ) {
            const avgVal = averageSlots[idx]?.mw ?? 0;
            const pct =
              avgVal !== 0
                ? (((currentSlots[idx]?.mw ?? 0) - avgVal) / avgVal) * 100
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
  }, [currentSlots, averageSlots]);

  const formattedDate = useMemo(() => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  const escalationCutoffTime = currentSlots.find((s) => s.escalationCutoffTime)?.escalationCutoffTime ?? null;

  const escalationCutoffDate = useMemo(() => {
    if (!escalationCutoffTime || !date) {
      return null;
    }
    const cutoffSource = dayjs(escalationCutoffTime).utc();
    const cutoff = dayjs(date).utc().set("hour", cutoffSource.hour()).set("minute", cutoffSource.minute()).add(1, "day");
    return cutoff;
  }, [escalationCutoffTime, date]);

  const cutoffTimeDisplay = useMemo(() => {
    if (!escalationCutoffTime) {
      return null;
    }
    return convertToUTCHoursFormat(escalationCutoffTime);
  }, [escalationCutoffTime]);

  const pastCutoffSlots = useMemo(() => {
    if (!escalationCutoffDate || !date) {
      return [];
    }
    return changes.filter(() => {
      const currentDate = dayjs().utc().add(1, "day");
      return currentDate.isAfter(escalationCutoffDate);
    });
  }, [changes, date, escalationCutoffDate]);

  const overLimitSlots = useMemo(() => {
    return currentSlots
      .filter((slot) => {
        if (slot.mw === null || slot.maximumRequestLimit === null) {
          return false;
        }
        return slot.mw > slot.maximumRequestLimit;
      })
      .map((slot, i) => ({
        index: i,
        time: convertToUTCHoursFormat(slot.time),
        mw: slot.mw,
        limit: slot.maximumRequestLimit,
      }));
  }, [currentSlots]);

  const deviatingChanges = changes.filter((c) => c.deviatesFromAverage);
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
        {pastCutoffSlots.length > 0 && (
          <Alert
            title="Editing past the cutoff time"
            description={
              <div className="text-xs mt-1">
                <p className="mb-2 text-sm">
                  The following {pastCutoffSlots.length} slot{pastCutoffSlots.length !== 1 ? "s are" : " is"} past
                  the cutoff time{cutoffTimeDisplay ? ` (${cutoffTimeDisplay})` : ""} — <strong>an escalation email will be sent</strong> upon submission.
                </p>
              </div>
            }
            type="error"
            showIcon
            icon={<WarningOutlined />}
          />
        )}

        {overLimitSlots.length > 0 && (
          <Alert
            title={<h6 className="text-base!">{`${overLimitSlots.length} slot${overLimitSlots.length !== 1 ? "s" : ""} exceed the MW limit`}</h6>}
            description={
              <div className="mt-1">
                {overLimitSlots.map((s) => (
                  <Tag key={s.index} color="orange" className="mb-1">
                    {s.time} — {s.mw?.toFixed(2)} MW (limit: {s.limit?.toFixed(2)} MW)
                  </Tag>
                ))}
              </div>
            }
            type="warning"
            showIcon
            icon={<WarningOutlined />}
          />
        )}

        <div>
          <h4 className="text-sm font-medium mb-2!">
            Load Profile {averageSlots ? "(vs Average)" : ""}
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
                  "bg-red-50": record.deviatesFromAverage,
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

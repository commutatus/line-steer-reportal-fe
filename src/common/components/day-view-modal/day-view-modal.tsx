import { useMemo } from "react";
import { Modal, Spin, Table, Tabs } from "antd";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import { convertToUTCHoursFormat } from "@/common/utils/helpers";
import { useQuery } from "@apollo/client";
import { GetLoadScheduledDayDetailsQuery, GetLoadScheduledDayDetailsQueryVariables } from "@/generated/graphql";
import { GET_LOAD_SCHEDULED_DAY_DETAILS } from "@/common/graphql/consumer.graphql";

interface DayViewModalProps {
  loadScheduleDayId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HourRow {
  key: number;
  hour: string;
  q0: string;
  q1: string;
  q2: string;
  q3: string;
}

const DayViewModal = ({
  loadScheduleDayId,
  open,
  onOpenChange,
}: DayViewModalProps) => {
  const { data: detailsData, loading: detailsLoading } = useQuery<GetLoadScheduledDayDetailsQuery, GetLoadScheduledDayDetailsQueryVariables>(GET_LOAD_SCHEDULED_DAY_DETAILS, {
    variables: { id: loadScheduleDayId ?? 0 },
    skip: !loadScheduleDayId || !open,
  });

  const loadScheduleDay = detailsData?.loadScheduleDays?.data?.[0] ?? null;
  const schedules = loadScheduleDay?.loadSchedules;

  const formattedDate = useMemo(() => {
    if (!loadScheduleDay?.date) {
      return "";
    }
    return dayjs(loadScheduleDay.date).format("dddd, MMMM D, YYYY");
  }, [loadScheduleDay?.date]);

  const dataSource: HourRow[] = useMemo(() => {
    if (!schedules) {
      return [];
    }
    return Array.from({ length: 24 }, (_, h) => {
      const base = h * 4;
      return {
        key: h,
        hour: `${h.toString().padStart(2, "0")}:00`,
        q0: schedules[base]?.load?.toFixed(2) ?? "—",
        q1: schedules[base + 1]?.load?.toFixed(2) ?? "—",
        q2: schedules[base + 2]?.load?.toFixed(2) ?? "—",
        q3: schedules[base + 3]?.load?.toFixed(2) ?? "—",
      };
    });
  }, [schedules]);

  const columns = [
    {
      title: "Hour",
      dataIndex: "hour",
      key: "hour",
      width: 80,
      fixed: "left" as const,
      render: (v: string) => (
        <span className="text-sm font-medium">{v}</span>
      ),
    },
    ...[0, 1, 2, 3].map((q) => ({
      title: `:${(q * 15).toString().padStart(2, "0")}`,
      dataIndex: `q${q}`,
      key: `q${q}`,
      width: 100,
      align: "right" as const,
      render: (v: string) => <span className="text-sm">{v}</span>,
    })),
  ];

  const chartOption = useMemo(() => {
    if (!schedules) {
      return {};
    }

    const labels = schedules.map((s) => convertToUTCHoursFormat(s.startTime ?? ""));
    const loadValues = schedules.map((s) => s.load ?? 0);
    const avgValues = schedules.map((s) => s.pastAverageLoad ?? 0);
    const hasAverageData = avgValues.some((v) => v > 0);
    const limitValues = schedules.map((s) => s.factory?.maximumRequestLimit ?? 0);
    const hasLimitData = limitValues.some((v) => v > 0);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      legend: {
        data: [
          "Selected Day",
          ...(hasAverageData ? ["Average"] : []),
          ...(hasLimitData ? ["Limit"] : []),
        ],
        bottom: 0,
      },
      grid: {
        left: "3%",
        right: "3%",
        top: "8%",
        bottom: "15%",
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          interval: 7,
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: "value",
        name: "MW",
        axisLabel: { fontSize: 10 },
      },
      series: [
        {
          name: "Selected Day",
          type: "line",
          data: loadValues,
          smooth: true,
          lineStyle: { width: 2 },
          itemStyle: { color: "#3b82f6" },
          areaStyle: { color: "rgba(59,130,246,0.1)" },
        },
        ...(hasAverageData
          ? [
              {
                name: "Average",
                type: "line",
                data: avgValues,
                smooth: true,
                lineStyle: { width: 2, type: "dashed" as const },
                itemStyle: { color: "#94a3b8" },
              },
            ]
          : []),
        ...(hasLimitData
          ? [
              {
                name: "Limit",
                type: "line",
                data: limitValues,
                smooth: false,
                lineStyle: { width: 2, type: "dashed" as const },
                itemStyle: { color: "#f59e0b" },
                symbol: "none" as const,
              },
            ]
          : []),
      ],
    };
  }, [schedules]);

  const tabItems = [
    {
      key: "grid",
      label: "Plan Grid",
      children: (
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size="small"
          bordered
          scroll={{ y: 480 }}
        />
      ),
    },
    {
      key: "chart",
      label: "Comparison Chart",
      children: (
        <div style={{ height: 480 }}>
          <ReactECharts
            option={chartOption}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`Plan for ${formattedDate}`}
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={640}
      destroyOnHidden
      centered
    >
      {detailsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="grid" items={tabItems} />
      )}
    </Modal>
  );
};

export default DayViewModal;

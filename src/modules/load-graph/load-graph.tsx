import RootLayout from "@/common/layouts/root-layout";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "antd";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import { GetSlotLevelLoadDataQuery, GetSlotLevelLoadDataQueryVariables, LoadScheduleDaySortColumn, SortDirection } from "@/generated/graphql";
import { GET_SLOT_LEVEL_LOAD_DATA } from "@/common/graphql/consumer.graphql";
import { useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";
import { convertToUTCHoursFormat } from "@/common/utils/helpers";
import ExportScheduleButton from "../consumer/components/ExportScheduleButton";
import PageLoader from "@/common/components-ui/page-loader/page-loader";

const presentDate = dayjs("2026-03-10");

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type ChartSeries = {
  name: string;
  type: string;
  data: number[];
  smooth: boolean;
  color: string;
  lineStyle?: { type: string; width: number };
  symbol: string;
  symbolSize: number;
}

const LoadGraph = () => {
  const dateRange = {
    from: presentDate.format("YYYY-MM-DD"),
    to: presentDate.format("YYYY-MM-DD"),
  };
  const { data, loading: isLoadGraphLoading } = useQuery<GetSlotLevelLoadDataQuery, GetSlotLevelLoadDataQueryVariables>(GET_SLOT_LEVEL_LOAD_DATA, {
    variables: {
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
      filters: {
        dateRange,
      }
    }
  });
  const { currentUser } = useGlobals();
  const { userType } = currentUser ?? {};
  const loadScheduleDays = useMemo(() => data?.loadScheduleDays?.data ?? [], [data]);

  const availableFacilities = useMemo(() => {
    if (!loadScheduleDays.length) return [];
    const facilityMap = new Map();
    for (const day of loadScheduleDays) {
      if (userType === UserType.CONSUMER) {
        if (day.park?.id && day.park?.name) {
          facilityMap.set(day.park.id, day.park.name);
        }
      } else {
        if (day.factory?.id && day.factory?.name) {
          facilityMap.set(day.factory.id, day.factory.name);
        }
      }
    }
    return Array.from(facilityMap, ([id, name]) => ({ id, name }));
  }, [loadScheduleDays, userType]);

  const facilityTitle = userType === UserType.CONSUMER ? "Parks" : "Factories";

  const [visibleFacilities, setVisibleFacilities] = useState<Record<string, boolean>>({});
  const [showTotal, setShowTotal] = useState(true);

  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    availableFacilities.forEach((facility) => {
      initialVisibility[facility.id] = true;
    });
    setVisibleFacilities(initialVisibility);
  }, [availableFacilities]);

  const chartOption = useMemo(() => {
    if (!loadScheduleDays.length) {
      return {
        tooltip: { trigger: 'axis' as const },
        legend: { bottom: 0, icon: 'circle' },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
        xAxis: { type: 'category' as const, data: [] },
        yAxis: { type: 'value' as const, name: 'Load (MWh)' },
        series: [],
      };
    }
    const uniqueTimeSlots = Array.from(
      new Set(
        loadScheduleDays.flatMap((day) => 
          day.loadSchedules?.map((schedule) => convertToUTCHoursFormat(schedule.startTime)) ?? []
        )
      )
    ).sort();

    const series: ChartSeries[] = [];

    availableFacilities.forEach((facility, index) => {
      if (!visibleFacilities[facility.id]) return;
      const color = CHART_COLORS[index % CHART_COLORS.length];
      const facilityDay = loadScheduleDays.find((day) => {
        if (userType === UserType.CONSUMER) {
          return day.park?.id === facility.id;
        }
        return day.factory?.id === facility.id;
      });

      const seriesData = uniqueTimeSlots.map((slot) => {
        if (!facilityDay?.loadSchedules) return 0;
        const schedule = facilityDay.loadSchedules.find(
          (s) => convertToUTCHoursFormat(s.startTime) === slot
        );
        return schedule?.load ?? 0;
      });

      series.push({
        name: facility.name,
        type: 'line',
        data: seriesData,
        smooth: true,
        color,
        symbol: 'circle',
        symbolSize: 8,
      });
    });

    if (showTotal) {
      const totalData = uniqueTimeSlots.map((slot) => {
        return loadScheduleDays.reduce((sum, day) => {
          const schedule = day.loadSchedules?.find(
            (s) => convertToUTCHoursFormat(s.startTime) === slot
          );
          return sum + (schedule?.load ?? 0);
        }, 0);
      });
      
      series.push({
        name: 'Total',
        type: 'line',
        data: totalData,
        smooth: true,
        color: '#64748b',
        lineStyle: { type: 'dashed', width: 2 },
        symbol: 'circle',
        symbolSize: 8,
      });
    }

    return {
      tooltip: {
        trigger: 'axis' as const,
      },
      legend: {
        bottom: 0,
        icon: 'circle',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category' as const,
        data: uniqueTimeSlots,
        boundaryGap: false,
        axisLabel: { 
          fontSize: 12, 
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#64748b' } },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Load (MWh)',
        axisLabel: { fontSize: 12 },
        axisLine: { lineStyle: { color: '#64748b' } },
        splitLine: { lineStyle: { type: 'dashed' as const, color: '#e2e8f0' } },
      },
      series,
    };
  }, [loadScheduleDays, userType, availableFacilities, visibleFacilities, showTotal]);

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    setVisibleFacilities((prev) => ({ ...prev, [facilityId]: checked }));
  };

  if (isLoadGraphLoading) {
    return (
      <RootLayout pageTitle="Load Graph">
        <PageLoader />
      </RootLayout>
    )
  }

  return (
    <RootLayout pageTitle="Load Graph">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-6">Load Graph</h2>
              <ExportScheduleButton date={dateRange} />
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-sm font-medium text-slate-700">Show {facilityTitle}:</span>
              {availableFacilities.map((facility, index) => (
                <Checkbox
                  key={facility.id}
                  checked={visibleFacilities[facility.id] ?? true}
                  onChange={(e) => handleFacilityToggle(facility.id, e.target.checked)}
                >
                  <span 
                    className="font-medium" 
                    style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                  >
                    {facility.name}
                  </span>
                </Checkbox>
              ))}
              <Checkbox
                checked={showTotal}
                onChange={(e) => setShowTotal(e.target.checked)}
              >
                <span className="text-slate-600 font-medium">Show Total</span>
              </Checkbox>
            </div>
          </div>
          
          <div className="p-6">
            <ReactECharts
              option={chartOption}
              style={{ height: '400px' }}
              notMerge
            />
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default LoadGraph;

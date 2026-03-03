import RootLayout from "@/common/layouts/root-layout";
import { useState, useMemo, useEffect } from "react";
import { Checkbox, Spin } from "antd";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import { GetOverallPlanQuery, GetOverallPlanQueryVariables, LoadScheduleDaySortColumn, SortDirection } from "@/generated/graphql";
import { OVERALL_PLAN_QUERY } from "@/common/graphql/consumer.graphql";
import { useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";

const presentDate = dayjs();

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
  const { data, loading: isLoadGraphLoading } = useQuery<GetOverallPlanQuery, GetOverallPlanQueryVariables>(OVERALL_PLAN_QUERY, {
    variables: {
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      },
      filters: {
        dateRange: {
          from: presentDate.subtract(7, 'day').toISOString(),
          to: presentDate.toISOString(),
        }
      }
    }
  });
  const { currentUser } = useGlobals();
  const { userType } = currentUser ?? {};
  const loadSummary = useMemo(() => data?.loadSummary?.data ?? [], [data]);

  const availableParks = useMemo(() => {
    if (!loadSummary.length) return [];
    const parkMap = new Map();
    loadSummary.forEach((day) => {
      day.parkLoads?.forEach((parkLoad) => {
        if (parkLoad.park?.id && parkLoad.park?.name) {
          parkMap.set(parkLoad.park.id, parkLoad.park.name);
        }
      });
    });
    return Array.from(parkMap, ([id, name]) => ({ id, name }));
  }, [loadSummary]);

  const availableFactories = useMemo(() => {
    if (!loadSummary.length) return [];
    const factoryMap = new Map();
    loadSummary.forEach((day) => {
      day.factoryLoads?.forEach((factoryLoad) => {
        if (factoryLoad.factory?.id && factoryLoad.factory?.name) {
          factoryMap.set(factoryLoad.factory.id, factoryLoad.factory.name);
        }
      });
    });
    return Array.from(factoryMap, ([id, name]) => ({ id, name }));
  }, [loadSummary]);

  const availableFacilities = useMemo(() => userType === UserType.CONSUMER ? availableParks : availableFactories, [availableParks, availableFactories, userType]);
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
    const dates = loadSummary.map((item) => dayjs(item.date).format('MMM DD'));

    const series: ChartSeries[] = [];

    availableFacilities.forEach((facility, index) => {
      if (!visibleFacilities[facility.id]) return;
      const color = CHART_COLORS[index % CHART_COLORS.length];
      const seriesData = loadSummary.map((item) => {
        if (userType === UserType.CONSUMER) {
          const parkLoad = item.parkLoads?.find((p) => p.park?.id === facility.id);
          return parkLoad?.totalLoad ?? 0;
        }
        const factoryLoad = item.factoryLoads?.find((f) => f.factory?.id === facility.id);
        return factoryLoad?.totalLoad ?? 0;
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
      const totalData = loadSummary.map((item) =>
        userType === UserType.CONSUMER ? item.totalParkLoad : item.totalFactoryLoad,
      );
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
        data: dates,
        boundaryGap: false,
        axisLabel: { fontSize: 12 },
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
  }, [loadSummary, userType, availableFacilities, visibleFacilities, showTotal]);

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    setVisibleFacilities((prev) => ({ ...prev, [facilityId]: checked }));
  };

  if (isLoadGraphLoading) {
    return (
      <RootLayout pageTitle="Load Graph">
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      </RootLayout>
    )
  }

  return (
    <RootLayout pageTitle="Load Graph">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Load Graph</h2>
            
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

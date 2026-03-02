import RootLayout from "@/common/layouts/root-layout";
import React, { useState, useMemo, useEffect } from "react";
import { Checkbox } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import { GetOverallPlanQuery, GetOverallPlanQueryVariables, LoadScheduleDaySortColumn, SortDirection } from "@/generated/graphql";
import { OVERALL_PLAN_QUERY } from "@/common/graphql/consumer.graphql";
import { useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";

const presentDate = dayjs();

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const LoadGraph = () => {
  const { data } = useQuery<GetOverallPlanQuery, GetOverallPlanQueryVariables>(OVERALL_PLAN_QUERY, {
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

  const [visibleParks, setVisibleParks] = useState<Record<string, boolean>>({});
  const [showTotal, setShowTotal] = useState(true);

  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    if (userType === UserType.CONSUMER) {
      availableParks.forEach((park) => {
        initialVisibility[park.id] = true;
      });
    } else {
      availableFactories.forEach((factory) => {
        initialVisibility[factory.id] = true;
      });
    }
    setVisibleParks(initialVisibility);
  }, [availableParks, availableFactories, userType]);

  const chartData = useMemo(() => {
    return loadSummary.map((item) => {
      const dataPoint: Record<string, string | number> = {
        date: dayjs(item.date).format('MMM DD'),
        total: userType === UserType.CONSUMER ? item.totalParkLoad : item.totalFactoryLoad,
      };
      
      if (userType === UserType.CONSUMER) {
        item.parkLoads?.forEach((parkLoad) => {
          if (parkLoad.park?.id) {
            dataPoint[`park_${parkLoad.park.id}`] = parkLoad.totalLoad;
          }
        });
      } else {
        item.factoryLoads?.forEach((factoryLoad) => {
          if (factoryLoad.factory?.id) {
            dataPoint[`factory_${factoryLoad.factory.id}`] = factoryLoad.totalLoad;
          }
        });
      }
      return dataPoint;
    });
  }, [loadSummary, userType]);

  const handleParkToggle = (parkId: string, checked: boolean) => {
    setVisibleParks((prev) => ({ ...prev, [parkId]: checked }));
  };

  const plants = userType === UserType.CONSUMER ? availableParks : availableFactories;

  return (
    <RootLayout pageTitle="Load Graph">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Load Graph</h2>
            
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-sm font-medium text-slate-700">Show Plants:</span>
              {plants.map((plant, index) => (
                <Checkbox
                  key={plant.id}
                  checked={visibleParks[plant.id] ?? true}
                  onChange={(e) => handleParkToggle(plant.id, e.target.checked)}
                >
                  <span 
                    className="font-medium" 
                    style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                  >
                    {plant.name}
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
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  label={{ value: 'Load (MWh)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                {plants.map((plant, index) => {
                  const color = CHART_COLORS[index % CHART_COLORS.length];
                  return visibleParks[plant.id] ? (
                    <Line 
                      key={plant.id}
                      type="monotone" 
                      dataKey={userType === UserType.CONSUMER ? `park_${plant.id}` : `factory_${plant.id}`}
                      stroke={color}
                      strokeWidth={2}
                      name={plant.name}
                      dot={{ fill: color, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ) : null;
                })}
                {showTotal && (
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#64748b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Total"
                    dot={{ fill: '#64748b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default LoadGraph;

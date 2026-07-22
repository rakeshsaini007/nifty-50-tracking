import React, { useState, useMemo } from 'react';
import { NiftyDataPoint, SummaryStats } from '../types';
import { GapMoveFilter, DirectionFilter, FilterMode, FilterMetric } from './GapMoveFilter';
import { FilteredDaysTable } from './FilteredDaysTable';
import { filterDataByMetric, computeGapMoveStats } from '../data/gapUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { Zap, PieChart as PieIcon, ArrowUpDown, Info, Target, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface GapAnalysisProps {
  data: NiftyDataPoint[];
  stats: SummaryStats;
}

export const GapAnalysisChart: React.FC<GapAnalysisProps> = ({ data, stats }) => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(0);
  const [direction, setDirection] = useState<DirectionFilter>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('min');
  const [filterMetric, setFilterMetric] = useState<FilterMetric>('openClose');

  // Filter out days without valid data first
  const validGapData = useMemo(() => {
    return data
      .filter(d => d.openCloseReturn !== undefined && !isNaN(d.openCloseReturn))
      .sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));
  }, [data]);

  // Apply metric filter (Open-Close % or Gap %)
  const gapData = useMemo(() => {
    return filterDataByMetric(validGapData, selectedThreshold, direction, filterMode, filterMetric);
  }, [validGapData, selectedThreshold, direction, filterMode, filterMetric]);

  // Compute stats on the filtered subset
  const filteredGapStats = useMemo(() => {
    return computeGapMoveStats(gapData);
  }, [gapData]);

  // Pie chart counts for filtered dataset
  const pieData = useMemo(() => {
    let upCount = 0;
    let downCount = 0;
    let flatCount = 0;

    gapData.forEach(d => {
      if (d.gapType === 'GapUp') upCount++;
      else if (d.gapType === 'GapDown') downCount++;
      else flatCount++;
    });

    return [
      { name: 'Gap Up', value: upCount, color: '#10b981' },
      { name: 'Gap Down', value: downCount, color: '#f43f5e' },
      { name: 'Flat', value: flatCount, color: '#94a3b8' }
    ].filter(d => d.value > 0);
  }, [gapData]);

  // Scatter data for correlation: Gap % (x) vs Open-Close Return % (y)
  const scatterData = useMemo(() => {
    return gapData.map(d => ({
      date: d.date,
      gapPercent: d.gapPercent || 0,
      openCloseReturn: d.openCloseReturn,
      dayRange: d.dayRange,
      gapType: d.gapType,
      isGreen: d.isGreen
    }));
  }, [gapData]);

  const CustomGapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d: NiftyDataPoint = payload[0].payload;
      const gapVal = d.gapPercent || 0;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <div className="font-bold border-b border-slate-800 pb-1 text-slate-200">{d.date}</div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Gap Type:</span>
            <span
              className={`font-semibold ${
                d.gapType === 'GapUp' ? 'text-emerald-400' : d.gapType === 'GapDown' ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {d.gapType}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Gap %:</span>
            <span className={`font-bold ${gapVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {gapVal > 0 ? '+' : ''}{gapVal.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Open-Close Return:</span>
            <span className={`font-bold ${d.openCloseReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {d.openCloseReturn > 0 ? '+' : ''}{d.openCloseReturn.toFixed(2)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <div className="font-bold text-indigo-300">{d.date}</div>
          <div>Gap Opening: <span className="font-semibold text-emerald-400">{d.gapPercent.toFixed(2)}%</span></div>
          <div>Intraday Return: <span className="font-semibold text-amber-400">{d.openCloseReturn.toFixed(2)}%</span></div>
          <div>Day Range: <span className="font-semibold text-slate-300">{d.dayRange} pts</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Interactive Gap / Open-Close Filter */}
      <GapMoveFilter
        selectedThreshold={selectedThreshold}
        onSelectThreshold={setSelectedThreshold}
        direction={direction}
        onSelectDirection={setDirection}
        filterMode={filterMode}
        onSelectFilterMode={setFilterMode}
        filterMetric={filterMetric}
        onSelectFilterMetric={setFilterMetric}
        matchingCount={gapData.length}
        totalCount={validGapData.length}
      />

      {/* Filter Performance Metrics Banner */}
      {selectedThreshold > 0 || direction !== 'all' ? (
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Filtered Sessions
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-extrabold text-slate-900">{filteredGapStats.count}</span>
              <span className="text-xs text-slate-500">Days</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {validGapData.length > 0 ? ((filteredGapStats.count / validGapData.length) * 100).toFixed(1) : 0}% of all data
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Intraday Win Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-extrabold text-emerald-600">{filteredGapStats.winRate}%</span>
              <span className="text-xs text-slate-500">Bullish</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {filteredGapStats.greenDays} Green / {filteredGapStats.redDays} Red
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Intraday Return
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-extrabold ${filteredGapStats.avgIntradayReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {filteredGapStats.avgIntradayReturn >= 0 ? '+' : ''}{filteredGapStats.avgIntradayReturn.toFixed(2)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Open to Close %
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Average Gap Size
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-extrabold ${filteredGapStats.avgGapPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {filteredGapStats.avgGapPercent >= 0 ? '+' : ''}{filteredGapStats.avgGapPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Max Up: +{filteredGapStats.maxGapUp.toFixed(2)}%
            </p>
          </div>
        </div>
      ) : null}

      {/* Top Row: Gap % Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gap % Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Daily Opening Gap Percentage
              </h2>
              <p className="text-xs text-slate-500">
                Opening price jump compared to previous day close
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
              Avg Gap: <span className="text-emerald-600 font-bold">{filteredGapStats.avgGapPercent >= 0 ? '+' : ''}{filteredGapStats.avgGapPercent.toFixed(2)}%</span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip content={<CustomGapTooltip />} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                <Bar dataKey="gapPercent" radius={[4, 4, 0, 0]}>
                  {gapData.map((entry) => (
                    <Cell
                      key={`gap-${entry.id}`}
                      fill={(entry.gapPercent || 0) >= 0 ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gap Type Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                Gap Type Ratio
              </h2>
            </div>
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-900">{stats.totalDays}</span>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total Days</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <div className="font-bold text-slate-900">
                  {item.value} days ({((item.value / stats.totalDays) * 100).toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Chart: Gap % vs Intraday Open-Close Return Scatter Plot */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-cyan-600" />
              Gap Open vs Intraday Holding Return
            </h2>
            <p className="text-xs text-slate-500">
              Does a Gap Up lead to intraday continuation (buying) or profit booking (fading)?
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>X-Axis: Gap % · Y-Axis: Open to Close %</span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="gapPercent"
                name="Gap %"
                unit="%"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                type="number"
                dataKey="openCloseReturn"
                name="Open-Close %"
                unit="%"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <ZAxis dataKey="dayRange" range={[60, 200]} name="Day Range" />
              <Tooltip content={<CustomScatterTooltip />} />
              <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="2 2" />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
              <Scatter data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`scatter-cell-${index}`}
                    fill={entry.isGreen ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* List of Days Having Filtered Gap % or Open-Close % */}
      <FilteredDaysTable
        data={gapData}
        threshold={selectedThreshold}
        direction={direction}
        filterMode={filterMode}
        filterMetric={filterMetric}
      />
    </div>
  );
};

import React from 'react';
import { NiftyDataPoint, SummaryStats } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { Activity, TrendingUp, Flame, ShieldAlert } from 'lucide-react';

interface DayRangeProps {
  data: NiftyDataPoint[];
  stats: SummaryStats;
}

export const DayRangeVolatilityChart: React.FC<DayRangeProps> = ({ data, stats }) => {
  const sortedData = [...data].sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));

  // Find top 3 most volatile days
  const topVolatile = [...data]
    .sort((a, b) => b.dayRange - a.dayRange)
    .slice(0, 3);

  const CustomRangeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d: NiftyDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <div className="font-bold border-b border-slate-800 pb-1 text-indigo-300">{d.date}</div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Day Range (H - L):</span>
            <span className="font-bold text-amber-400">{d.dayRange.toFixed(2)} pts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">High / Low:</span>
            <span className="font-semibold text-slate-200">
              ₹{d.high.toLocaleString('en-IN')} / ₹{d.low.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Open to Close:</span>
            <span className={`font-semibold ${d.isGreen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {d.openCloseReturn > 0 ? '+' : ''}{d.openCloseReturn.toFixed(2)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Top Cards: Volatility Highs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topVolatile.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
                <Flame className={`w-3.5 h-3.5 ${idx === 0 ? 'text-amber-500' : 'text-indigo-500'}`} />
                <span># {idx + 1} Volatile Session</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {item.dayRange} <span className="text-xs font-normal text-slate-500">pts</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {item.date} · {item.isGreen ? 'Bullish' : 'Bearish'}
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-700">
                ₹{item.high.toLocaleString('en-IN')}
              </span>
              <span className="block text-xs text-slate-400">
                ₹{item.low.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart: Day Range Bars + Open-Close % Return Line */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Intraday Volatility (Day Range Points)
            </h2>
            <p className="text-xs text-slate-500">
              Difference between High and Low price per trading session
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-xl border border-indigo-100">
            <span>Average Range: <strong>{stats.avgDayRange.toFixed(1)} pts</strong></span>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v}pt`}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v}%`}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomRangeTooltip />} />
              <ReferenceLine
                yAxisId="left"
                y={stats.avgDayRange}
                stroke="#6366f1"
                strokeDasharray="3 3"
                label={{ value: 'Avg Range', fill: '#6366f1', fontSize: 10 }}
              />
              <Bar yAxisId="left" dataKey="dayRange" radius={[4, 4, 0, 0]}>
                {sortedData.map((entry) => (
                  <Cell
                    key={`range-${entry.id}`}
                    fill={entry.dayRange >= stats.avgDayRange ? '#6366f1' : '#cbd5e1'}
                  />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="openCloseReturn"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                name="Open-Close %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

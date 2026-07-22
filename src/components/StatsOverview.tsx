import React from 'react';
import { SummaryStats } from '../types';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Zap,
  Target,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';

interface StatsOverviewProps {
  stats: SummaryStats;
  dataCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, dataCount }) => {
  const greenPercent = stats.totalDays > 0 ? (stats.greenDaysCount / stats.totalDays) * 100 : 0;
  const gapUpPercent = stats.totalDays > 0 ? (stats.gapUpCount / stats.totalDays) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Return & Trend */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            NIFTY 50 Total Return
          </span>
          <div className={`p-2 rounded-xl ${stats.totalChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {stats.totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{stats.latestClose ? stats.latestClose.toLocaleString('en-IN') : '0'}
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                stats.totalChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {stats.totalChange >= 0 ? '+' : ''}
              {stats.totalChangePercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.totalChange >= 0 ? '+' : ''}
            {stats.totalChange.toFixed(2)} pts from ₹{stats.firstOpen.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full ${stats.totalChange >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${Math.min(100, Math.abs(stats.totalChangePercent) * 10)}%` }}
          />
        </div>
      </div>

      {/* Card 2: Green vs Red Days */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bullish vs Bearish Days
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-emerald-600">{stats.greenDaysCount}</span>
              <span className="text-xs text-slate-500">Green</span>
            </div>
            <span className="text-slate-300 font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-rose-600">{stats.redDaysCount}</span>
              <span className="text-xs text-slate-500">Red</span>
            </div>
            <span className="text-xs font-bold text-slate-700">{greenPercent.toFixed(0)}% Win Rate</span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Avg Green: <span className="text-emerald-600 font-medium">+{stats.avgGreenReturn.toFixed(2)}%</span> ·
            Avg Red: <span className="text-rose-600 font-medium">{stats.avgRedReturn.toFixed(2)}%</span>
          </p>
        </div>

        {/* Progress bar green vs red */}
        <div className="w-full bg-rose-200 h-2 rounded-full mt-3 flex overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${greenPercent}%` }}
            title={`Bullish: ${greenPercent.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Card 3: Gap Open Analysis */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Gap Open Frequency
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {stats.gapUpCount} Gap Ups
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {stats.gapDownCount} Gap Downs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Avg Gap Up: <span className="text-emerald-600 font-semibold">+{stats.avgGapUpPercent.toFixed(2)}%</span> ·
            Avg Gap Down: <span className="text-rose-600 font-semibold">{stats.avgGapDownPercent.toFixed(2)}%</span>
          </p>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 flex overflow-hidden">
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${stats.totalDays > 0 ? (stats.gapUpCount / stats.totalDays) * 100 : 0}%` }}
          />
          <div
            className="bg-slate-300 h-full"
            style={{ width: `${stats.totalDays > 0 ? (stats.flatCount / stats.totalDays) * 100 : 0}%` }}
          />
          <div
            className="bg-rose-500 h-full"
            style={{ width: `${stats.totalDays > 0 ? (stats.gapDownCount / stats.totalDays) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card 4: Volatility & High/Low Range */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Price Range & Volatility
          </span>
          <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">
              {stats.avgDayRange.toFixed(1)} pts
            </span>
            <span className="text-xs text-slate-500">Avg Day Range</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex justify-between">
            <span>High: <strong className="text-slate-800">₹{stats.highestPrice.toLocaleString('en-IN')}</strong></span>
            <span>Low: <strong className="text-slate-800">₹{stats.lowestPrice.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
        <div className="mt-3 text-[11px] font-medium text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>{stats.totalDays} Trading Sessions Analyzed</span>
          <span className="text-indigo-600 hover:underline cursor-pointer">View Details</span>
        </div>
      </div>
    </div>
  );
};

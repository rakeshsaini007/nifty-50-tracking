import React from 'react';
import { Calendar, Filter, RotateCcw, Clock, ArrowRight } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minAvailableDate?: string;
  maxAvailableDate?: string;
  totalDaysCount: number;
  filteredDaysCount: number;
  onReset: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minAvailableDate = '',
  maxAvailableDate = '',
  totalDaysCount,
  filteredDaysCount,
  onReset
}) => {
  const isFiltered = Boolean(
    (startDate && startDate !== minAvailableDate) ||
    (endDate && endDate !== maxAvailableDate)
  );

  // Quick preset helper
  const applyPreset = (preset: 'all' | '30d' | '90d' | '6m' | 'ytd' | '2025' | '2024') => {
    if (preset === 'all') {
      onReset();
      return;
    }

    if (!maxAvailableDate) return;
    const maxD = new Date(maxAvailableDate);

    if (preset === '30d') {
      const d = new Date(maxD);
      d.setDate(d.getDate() - 30);
      onStartDateChange(d.toISOString().slice(0, 10));
      onEndDateChange(maxAvailableDate);
    } else if (preset === '90d') {
      const d = new Date(maxD);
      d.setDate(d.getDate() - 90);
      onStartDateChange(d.toISOString().slice(0, 10));
      onEndDateChange(maxAvailableDate);
    } else if (preset === '6m') {
      const d = new Date(maxD);
      d.setMonth(d.getMonth() - 6);
      onStartDateChange(d.toISOString().slice(0, 10));
      onEndDateChange(maxAvailableDate);
    } else if (preset === 'ytd') {
      const year = maxD.getFullYear();
      onStartDateChange(`${year}-01-01`);
      onEndDateChange(maxAvailableDate);
    } else if (preset === '2025') {
      onStartDateChange('2025-01-01');
      onEndDateChange('2025-12-31');
    } else if (preset === '2024') {
      onStartDateChange('2024-01-01');
      onEndDateChange('2024-12-31');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>Period Filter (From Date to To Date)</span>
              {isFiltered && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Active Filter
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Filter charts, stats, gap moves, and tables by custom trading date range
            </p>
          </div>
        </div>

        {/* Count Badge & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-semibold border border-slate-200">
            Showing <span className="text-indigo-600 font-extrabold">{filteredDaysCount}</span> of {totalDaysCount} Days
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="px-2.5 py-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl border border-rose-200 transition flex items-center gap-1 cursor-pointer"
              title="Reset Date Range to All Time"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Period</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Pickers & Quick Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Inputs */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* From Date */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-500">From Date:</span>
            <input
              type="date"
              value={startDate}
              min={minAvailableDate}
              max={endDate || maxAvailableDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />

          {/* To Date */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-500">To Date:</span>
            <input
              type="date"
              value={endDate}
              min={startDate || minAvailableDate}
              max={maxAvailableDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Quick:
          </span>

          <button
            onClick={() => applyPreset('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer border ${
              !isFiltered
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
            }`}
          >
            All Time
          </button>

          <button
            onClick={() => applyPreset('30d')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            Last 30D
          </button>

          <button
            onClick={() => applyPreset('90d')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            Last 90D
          </button>

          <button
            onClick={() => applyPreset('6m')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            Last 6M
          </button>

          <button
            onClick={() => applyPreset('ytd')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            YTD
          </button>

          <button
            onClick={() => applyPreset('2025')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            Year 2025
          </button>

          <button
            onClick={() => applyPreset('2024')}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            Year 2024
          </button>
        </div>
      </div>
    </div>
  );
};

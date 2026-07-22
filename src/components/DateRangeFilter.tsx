import React from 'react';
import { Calendar, Filter, RotateCcw, Clock, ArrowRight } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minAvailableDate?: string;
  maxAvailableDate?: string;
  availableYears?: string[];
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
  availableYears = [],
  totalDaysCount,
  filteredDaysCount,
  onReset
}) => {
  const isFiltered = Boolean(
    (startDate && startDate !== minAvailableDate) ||
    (endDate && endDate !== maxAvailableDate)
  );

  // Compute years list dynamically
  const yearsToDisplay = React.useMemo(() => {
    if (availableYears && availableYears.length > 0) {
      return availableYears;
    }
    if (!minAvailableDate || !maxAvailableDate) return ['2026', '2025', '2024'];
    const minY = parseInt(minAvailableDate.slice(0, 4), 10);
    const maxY = parseInt(maxAvailableDate.slice(0, 4), 10);
    const years: string[] = [];
    if (!isNaN(minY) && !isNaN(maxY)) {
      for (let y = maxY; y >= minY; y--) {
        years.push(String(y));
      }
    }
    return years.length > 0 ? years : ['2026', '2025', '2024'];
  }, [availableYears, minAvailableDate, maxAvailableDate]);

  // Check if current filter corresponds to a full specific year
  const activeSelectedYear = React.useMemo(() => {
    if (!startDate || !endDate) return '';
    if (startDate.endsWith('-01-01') && endDate.endsWith('-12-31')) {
      const startY = startDate.slice(0, 4);
      const endY = endDate.slice(0, 4);
      if (startY === endY) return startY;
    }
    return '';
  }, [startDate, endDate]);

  // Quick preset helper
  const applyPreset = (preset: 'all' | '30d' | '90d' | '6m' | 'ytd') => {
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
    }
  };

  const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const yr = e.target.value;
    if (!yr) return;
    onStartDateChange(`${yr}-01-01`);
    onEndDateChange(`${yr}-12-31`);
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

          {/* Year Dropdown containing all sheet data years */}
          <div className="relative inline-block">
            <select
              value={activeSelectedYear}
              onChange={handleYearSelect}
              className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition cursor-pointer border focus:outline-none appearance-none pr-7 ${
                activeSelectedYear
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <option value="" className="text-slate-900 bg-white">
                Year ▾
              </option>
              {yearsToDisplay.map((yr) => (
                <option key={yr} value={yr} className="text-slate-900 bg-white font-medium">
                  Year {yr}
                </option>
              ))}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 ${activeSelectedYear ? 'text-white' : 'text-slate-500'}`}>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

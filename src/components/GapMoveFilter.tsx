import React from 'react';
import { Filter, Zap, TrendingUp, TrendingDown, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const GAP_THRESHOLDS = [0, 0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00] as const;
export type GapThresholdValue = typeof GAP_THRESHOLDS[number];

export type DirectionFilter = 'all' | 'up' | 'down';
export type FilterMode = 'min' | 'range';

interface GapMoveFilterProps {
  selectedThreshold: number;
  onSelectThreshold: (val: number) => void;
  direction: DirectionFilter;
  onSelectDirection: (dir: DirectionFilter) => void;
  filterMode: FilterMode;
  onSelectFilterMode: (mode: FilterMode) => void;
  matchingCount?: number;
  totalCount?: number;
  compact?: boolean;
}

export const GapMoveFilter: React.FC<GapMoveFilterProps> = ({
  selectedThreshold,
  onSelectThreshold,
  direction,
  onSelectDirection,
  filterMode,
  onSelectFilterMode,
  matchingCount,
  totalCount,
  compact = false
}) => {
  return (
    <div className={`bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-md space-y-3 ${compact ? 'text-xs' : ''}`}>
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              NIFTY Gap Move % Filter
            </h3>
            <p className="text-[11px] text-slate-400">
              Isolate market behavior for specific opening gap sizes
            </p>
          </div>
        </div>

        {/* Filter Mode & Direction Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Direction Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700/80 text-xs">
            <button
              onClick={() => onSelectDirection('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                direction === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Both (Up & Down)
            </button>
            <button
              onClick={() => onSelectDirection('up')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                direction === 'up'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Gap Up</span>
            </button>
            <button
              onClick={() => onSelectDirection('down')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                direction === 'down'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>Gap Down</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700/80 text-xs">
            <button
              onClick={() => onSelectFilterMode('min')}
              title="Filter records with Gap >= Threshold"
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterMode === 'min'
                  ? 'bg-slate-700 text-amber-300 shadow-sm border border-slate-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Minimum (≥)
            </button>
            <button
              onClick={() => onSelectFilterMode('range')}
              title="Filter records in exact bucket range (e.g. 0.50% to 0.75%)"
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterMode === 'range'
                  ? 'bg-slate-700 text-amber-300 shadow-sm border border-slate-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bracket Range
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Pills Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Select Gap Move Size (%):</span>
          {matchingCount !== undefined && totalCount !== undefined && (
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Showing {matchingCount} of {totalCount} Days ({totalCount > 0 ? ((matchingCount / totalCount) * 100).toFixed(0) : 0}%)
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => onSelectThreshold(0)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
              selectedThreshold === 0
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700'
            }`}
          >
            All Gaps
          </button>

          {GAP_THRESHOLDS.filter(t => t > 0).map((t) => {
            const isSelected = selectedThreshold === t;
            let label = `${t.toFixed(2)}%`;
            if (t === 1.0) label = '1.00%';
            if (t === 2.0) label = '2.00%';

            let displayLabel = filterMode === 'min' ? `≥ ${label}` : `${label} Range`;

            return (
              <button
                key={t}
                onClick={() => onSelectThreshold(t)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white border-slate-700'
                }`}
              >
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

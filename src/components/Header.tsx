import React from 'react';
import { ViewTab, SummaryStats } from '../types';
import {
  TrendingUp,
  BarChart3,
  Table as TableIcon,
  Upload,
  Download,
  RotateCcw,
  Zap,
  Activity,
  RefreshCw,
  Globe
} from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  stats: SummaryStats;
  onOpenImport: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  savedGasUrl?: string;
  onSyncGas?: () => void;
  isSyncingGas?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onOpenImport,
  onExportCSV,
  onResetData,
  savedGasUrl,
  onSyncGas,
  isSyncingGas
}) => {
  const isPositive = stats.totalChange >= 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  NIFTY 50 Analytics
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Google Sheet "Data"
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trading Performance, Gap % & Intraday Volatility Visualizer
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center flex-wrap gap-3 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-xs">
            <div className="px-2 border-r border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Latest Close</span>
              <span className="font-bold text-slate-100 text-sm">
                ₹{stats.latestClose ? stats.latestClose.toLocaleString('en-IN') : '0'}
              </span>
            </div>

            <div className="px-2 border-r border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Period Change</span>
              <span
                className={`font-semibold text-sm flex items-center gap-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {stats.totalChange.toFixed(2)} ({stats.totalChangePercent.toFixed(2)}%)
              </span>
            </div>

            <div className="px-2">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Avg Day Range</span>
              <span className="font-semibold text-slate-200 text-sm">
                {stats.avgDayRange.toFixed(1)} pts
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {savedGasUrl && onSyncGas && (
              <button
                onClick={onSyncGas}
                disabled={isSyncingGas}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                title="Sync live data from connected Google Apps Script Web App"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGas ? 'animate-spin' : ''}`} />
                <span>{isSyncingGas ? 'Syncing...' : 'Sync Sheet'}</span>
              </button>
            )}

            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
              title="Connect Google Apps Script URL or import raw sheet data"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{savedGasUrl ? 'Apps Script Config' : 'Connect Sheet / Import'}</span>
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Download filtered CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Reset to default NIFTY 50 dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-5 border-b border-slate-800 overflow-x-auto pb-px scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('price')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'price'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Price & Candlesticks</span>
          </button>

          <button
            onClick={() => setActiveTab('gap')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'gap'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Gap Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('volatility')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'volatility'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Day Range & Returns</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'table'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Data Sheet Table</span>
          </button>
        </div>
      </div>
    </header>
  );
};

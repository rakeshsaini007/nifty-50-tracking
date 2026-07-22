import React, { useState, useMemo } from 'react';
import { NiftyDataPoint } from '../types';
import {
  Calendar,
  ArrowUpDown,
  Download,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Filter
} from 'lucide-react';

interface FilteredDaysTableProps {
  data: NiftyDataPoint[];
  threshold: number;
  direction: string;
  filterMode: string;
}

type SortField = 'date' | 'gapPercent' | 'openCloseReturn' | 'dayRange' | 'open' | 'close';

export const FilteredDaysTable: React.FC<FilteredDaysTableProps> = ({
  data,
  threshold,
  direction,
  filterMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default latest date first

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    return data
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.date.toLowerCase().includes(term) ||
          item.gapType.toLowerCase().includes(term) ||
          (item.gapPercent !== null && item.gapPercent.toString().includes(term))
        );
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'date') {
          valA = a.parsedDate || a.date;
          valB = b.parsedDate || b.date;
        } else {
          valA = valA ?? 0;
          valB = valB ?? 0;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [data, searchTerm, sortField, sortAsc]);

  const handleExportFilteredCSV = () => {
    if (filteredAndSortedData.length === 0) return;

    const headers = [
      'Index Name',
      'Date',
      'Open',
      'High',
      'Low',
      'Close',
      'Gap %',
      'Gap Type',
      'Open-Close Return %',
      'Day Range'
    ];

    const rows = filteredAndSortedData.map((d) => [
      d.indexName,
      d.date,
      d.open,
      d.high,
      d.low,
      d.close,
      d.gapPercent !== null ? d.gapPercent : '',
      d.gapType,
      d.openCloseReturn,
      d.dayRange
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Filtered_Gap_Days_${threshold}%_${direction}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Label description
  let filterTitle = 'All Available Trading Days';
  if (threshold > 0 || direction !== 'all') {
    let modeText = filterMode === 'min' ? '≥' : 'in Range';
    let dirText = direction === 'up' ? 'Gap Up' : direction === 'down' ? 'Gap Down' : 'Gap Move';
    filterTitle = `Days with ${dirText} ${modeText} ${threshold.toFixed(2)}%`;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Table Header Controls */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>List of Matching Trading Days</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {filteredAndSortedData.length} Days
              </span>
            </h3>
            <p className="text-xs text-slate-400">{filterTitle}</p>
          </div>
        </div>

        {/* Controls: Search & CSV Export */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search date or gap..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={handleExportFilteredCSV}
            disabled={filteredAndSortedData.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Download CSV of filtered days"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export List</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 z-10 border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-3">Gap Type</th>

              <th
                onClick={() => handleSort('gapPercent')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gap %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('open')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none text-right"
              >
                Open (₹)
              </th>

              <th className="py-3 px-3 text-right">High (₹)</th>
              <th className="py-3 px-3 text-right">Low (₹)</th>

              <th
                onClick={() => handleSort('close')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none text-right"
              >
                Close (₹)
              </th>

              <th
                onClick={() => handleSort('openCloseReturn')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Intraday Return</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('dayRange')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Range (Pts)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-3 text-center">Outcome</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No trading sessions match this gap filter threshold.</p>
                    <p className="text-xs text-slate-400">Try selecting a lower Gap % threshold or clearing filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row) => {
                const gapVal = row.gapPercent || 0;
                const returnVal = row.openCloseReturn || 0;

                return (
                  <tr key={row.id || row.date} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {row.date}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.gapType === 'GapUp' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <TrendingUp className="w-3 h-3" />
                          <span>Gap Up</span>
                        </span>
                      ) : row.gapType === 'GapDown' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <TrendingDown className="w-3 h-3" />
                          <span>Gap Down</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Flat</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-extrabold whitespace-nowrap">
                      <span className={gapVal > 0 ? 'text-emerald-600' : gapVal < 0 ? 'text-rose-600' : 'text-slate-600'}>
                        {gapVal > 0 ? '+' : ''}{gapVal.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      ₹{row.open.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ₹{row.high.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ₹{row.low.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{row.close.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                      <span className={returnVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {returnVal >= 0 ? '+' : ''}{returnVal.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700 font-mono">
                      {row.dayRange.toFixed(1)}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {row.isGreen ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Bullish</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Bearish</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredAndSortedData.length}</span> matching trading days
        </div>
        <div className="text-[11px] text-slate-400">
          Click column headers to sort chronologically or by move magnitude
        </div>
      </div>
    </div>
  );
};

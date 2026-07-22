import React, { useState, useMemo } from 'react';
import { NiftyDataPoint } from '../types';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface DataTableProps {
  data: NiftyDataPoint[];
  onUpdateData: (newData: NiftyDataPoint[]) => void;
  onOpenImport: () => void;
  onExportCSV: () => void;
}

type SortField = 'date' | 'open' | 'high' | 'low' | 'close' | 'gapPercent' | 'openCloseReturn' | 'dayRange';
type SortOrder = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  data,
  onUpdateData,
  onOpenImport,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gapFilter, setGapFilter] = useState<string>('all');
  const [gapMoveFilter, setGapMoveFilter] = useState<string>('all');
  const [candleFilter, setCandleFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<NiftyDataPoint>>({});

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    return data
      .filter(item => {
        // Search filter
        const matchesSearch = item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.indexName.toLowerCase().includes(searchTerm.toLowerCase());

        // Gap Type filter
        const matchesGapType = gapFilter === 'all' || item.gapType === gapFilter;

        // Gap Move % filter
        let matchesGapMove = true;
        if (gapMoveFilter !== 'all') {
          const absGap = item.gapPercent !== null && !isNaN(item.gapPercent) ? Math.abs(item.gapPercent) : -1;
          if (absGap < 0) {
            matchesGapMove = false;
          } else if (gapMoveFilter.startsWith('min_')) {
            const minVal = parseFloat(gapMoveFilter.replace('min_', ''));
            matchesGapMove = absGap >= minVal;
          } else if (gapMoveFilter.startsWith('range_')) {
            if (gapMoveFilter === 'range_0.25_0.50') matchesGapMove = absGap >= 0.25 && absGap < 0.50;
            else if (gapMoveFilter === 'range_0.50_0.75') matchesGapMove = absGap >= 0.50 && absGap < 0.75;
            else if (gapMoveFilter === 'range_0.75_1.00') matchesGapMove = absGap >= 0.75 && absGap < 1.00;
            else if (gapMoveFilter === 'range_1.00_1.25') matchesGapMove = absGap >= 1.00 && absGap < 1.25;
            else if (gapMoveFilter === 'range_1.25_1.50') matchesGapMove = absGap >= 1.25 && absGap < 1.50;
            else if (gapMoveFilter === 'range_1.50_1.75') matchesGapMove = absGap >= 1.50 && absGap < 1.75;
            else if (gapMoveFilter === 'range_1.75_2.00') matchesGapMove = absGap >= 1.75 && absGap < 2.00;
            else if (gapMoveFilter === 'range_2.00_above') matchesGapMove = absGap >= 2.00;
          }
        }

        // Candle filter
        const matchesCandle =
          candleFilter === 'all' ||
          (candleFilter === 'green' && item.isGreen) ||
          (candleFilter === 'red' && !item.isGreen);

        return matchesSearch && matchesGapType && matchesGapMove && matchesCandle;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'date') {
          valA = a.parsedDate;
          valB = b.parsedDate;
        }

        if (valA === null || valA === undefined) valA = -Infinity;
        if (valB === null || valB === undefined) valB = -Infinity;

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, searchTerm, gapFilter, candleFilter, sortField, sortOrder]);

  const startEdit = (item: NiftyDataPoint) => {
    setEditingId(item.id);
    setEditRow({ ...item });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const open = Number(editRow.open) || 0;
    const high = Number(editRow.high) || 0;
    const low = Number(editRow.low) || 0;
    const close = Number(editRow.close) || 0;
    const dayRange = high >= low ? Math.round((high - low) * 100) / 100 : 0;
    const openCloseReturn = open > 0 ? Math.round(((close - open) / open) * 100000) / 1000 : 0;

    const updated = data.map(item => {
      if (item.id === editingId) {
        return {
          ...item,
          ...editRow,
          open,
          high,
          low,
          close,
          dayRange,
          openCloseReturn,
          isGreen: close >= open
        } as NiftyDataPoint;
      }
      return item;
    });

    onUpdateData(updated);
    setEditingId(null);
  };

  const deleteRow = (id: string) => {
    onUpdateData(data.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            NIFTY 50 Trading Data Sheet
          </h2>
          <p className="text-xs text-slate-500">
            Interactive table with live filters, editing, and sorting capabilities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 sm:w-44"
            />
          </div>

          {/* Gap Type Filter */}
          <select
            value={gapFilter}
            onChange={(e) => setGapFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="all">All Gap Types</option>
            <option value="GapUp">Gap Up</option>
            <option value="GapDown">Gap Down</option>
            <option value="Flat">Flat</option>
          </select>

          {/* Gap Move % Filter */}
          <select
            value={gapMoveFilter}
            onChange={(e) => setGapMoveFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-amber-50/80 border border-amber-200 text-amber-900 font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Gap Move %</option>
            <optgroup label="Minimum Move (≥)">
              <option value="min_0.25">≥ 0.25% Move</option>
              <option value="min_0.50">≥ 0.50% Move</option>
              <option value="min_0.75">≥ 0.75% Move</option>
              <option value="min_1.00">≥ 1.00% Move</option>
              <option value="min_1.25">≥ 1.25% Move</option>
              <option value="min_1.50">≥ 1.50% Move</option>
              <option value="min_1.75">≥ 1.75% Move</option>
              <option value="min_2.00">≥ 2.00% Move</option>
            </optgroup>
            <optgroup label="Bracket Ranges">
              <option value="range_0.25_0.50">0.25% – 0.50% Move</option>
              <option value="range_0.50_0.75">0.50% – 0.75% Move</option>
              <option value="range_0.75_1.00">0.75% – 1.00% Move</option>
              <option value="range_1.00_1.25">1.00% – 1.25% Move</option>
              <option value="range_1.25_1.50">1.25% – 1.50% Move</option>
              <option value="range_1.50_1.75">1.50% – 1.75% Move</option>
              <option value="range_1.75_2.00">1.75% – 2.00% Move</option>
              <option value="range_2.00_above">&gt; 2.00% Move</option>
            </optgroup>
          </select>

          {/* Candle Color Filter */}
          <select
            value={candleFilter}
            onChange={(e) => setCandleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="all">All Candles</option>
            <option value="green">Bullish (Green)</option>
            <option value="red">Bearish (Red)</option>
          </select>

          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-200 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste / Add</span>
          </button>
        </div>
      </div>

      {/* Table Data Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none">
            <tr>
              <th className="py-3 px-4">Index Name</th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {sortField === 'date' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('open')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Open</span>
                  {sortField === 'open' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('high')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>High</span>
                  {sortField === 'high' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('low')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Low</span>
                  {sortField === 'low' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('close')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Close</span>
                  {sortField === 'close' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('gapPercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gap %</span>
                  {sortField === 'gapPercent' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-center">Gap Type</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('openCloseReturn')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Open-Close %</span>
                  {sortField === 'openCloseReturn' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSort('dayRange')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Day Range</span>
                  {sortField === 'dayRange' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-400">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row) => {
                const isEditing = editingId === row.id;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition ${
                      row.isGreen ? 'bg-emerald-50/10' : 'bg-rose-50/10'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-700">
                      {row.indexName}
                    </td>

                    <td className="py-2.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editRow.date || ''}
                          onChange={(e) => setEditRow({ ...editRow, date: e.target.value })}
                          className="w-20 px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        row.date
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right font-medium text-slate-800">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow.open || ''}
                          onChange={(e) => setEditRow({ ...editRow, open: parseFloat(e.target.value) })}
                          className="w-20 text-right px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        `₹${row.open.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-600">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow.high || ''}
                          onChange={(e) => setEditRow({ ...editRow, high: parseFloat(e.target.value) })}
                          className="w-20 text-right px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        `₹${row.high.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-rose-600">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow.low || ''}
                          onChange={(e) => setEditRow({ ...editRow, low: parseFloat(e.target.value) })}
                          className="w-20 text-right px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        `₹${row.low.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow.close || ''}
                          onChange={(e) => setEditRow({ ...editRow, close: parseFloat(e.target.value) })}
                          className="w-20 text-right px-1 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        `₹${row.close.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        (row.gapPercent || 0) > 0
                          ? 'text-emerald-600'
                          : (row.gapPercent || 0) < 0
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.gapPercent !== null ? `${row.gapPercent > 0 ? '+' : ''}${row.gapPercent.toFixed(2)}%` : '-'}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          row.gapType === 'GapUp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.gapType === 'GapDown'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.gapType}
                      </span>
                    </td>

                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        row.openCloseReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.openCloseReturn >= 0 ? '+' : ''}
                      {row.openCloseReturn.toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                      {row.dayRange.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(row)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Edit Row"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          Showing <strong>{filteredAndSortedData.length}</strong> of <strong>{data.length}</strong> total rows
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1 text-slate-700 font-medium hover:text-indigo-600 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Filtered CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

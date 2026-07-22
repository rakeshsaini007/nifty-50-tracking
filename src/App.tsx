import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NiftyDataPoint, ViewTab } from './types';
import { INITIAL_NIFTY_DATA, computeStats } from './data/niftySample';
import { fetchGoogleAppsScriptData } from './data/gasService';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { PriceCandlestickChart } from './components/PriceCandlestickChart';
import { GapAnalysisChart } from './components/GapAnalysisChart';
import { DayRangeVolatilityChart } from './components/DayRangeVolatilityChart';
import { DataTable } from './components/DataTable';
import { DataImportModal } from './components/DataImportModal';
import { DateRangeFilter } from './components/DateRangeFilter';
import { TrendingUp } from 'lucide-react';

const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzV3RHp5lMkFVQJvn27o_qLCTDhIOR6WVvCD5kdpb_3VINGCO3dZKLv1KI6DRSSLpIo/exec';

export default function App() {
  // Saved Google Apps Script URL
  const [savedGasUrl, setSavedGasUrl] = useState<string>(() => {
    return localStorage.getItem('nifty_gas_url') || DEFAULT_GAS_URL;
  });

  const [isSyncingGas, setIsSyncingGas] = useState<boolean>(false);

  // Load initial data from localStorage if available, or fallback to INITIAL_NIFTY_DATA
  const [niftyData, setNiftyData] = useState<NiftyDataPoint[]>(() => {
    try {
      const saved = localStorage.getItem('nifty_50_trading_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading saved nifty data:', err);
    }
    return INITIAL_NIFTY_DATA;
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Date Range Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Calculate available date bounds in current dataset
  const minAvailableDate = useMemo(() => {
    if (niftyData.length === 0) return '';
    const sorted = [...niftyData].sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));
    return sorted[0].parsedDate;
  }, [niftyData]);

  const maxAvailableDate = useMemo(() => {
    if (niftyData.length === 0) return '';
    const sorted = [...niftyData].sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));
    return sorted[sorted.length - 1].parsedDate;
  }, [niftyData]);

  // Filtered dataset based on From Date and To Date
  const filteredNiftyData = useMemo(() => {
    if (!startDate && !endDate) return niftyData;
    return niftyData.filter(d => {
      const itemDate = d.parsedDate;
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  }, [niftyData, startDate, endDate]);

  const handleResetDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  // Sync data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nifty_50_trading_data', JSON.stringify(niftyData));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [niftyData]);

  const handleSaveGasUrl = (url: string) => {
    setSavedGasUrl(url);
    localStorage.setItem('nifty_gas_url', url);
  };

  const handleSyncGas = useCallback(async () => {
    if (!savedGasUrl) return;
    setIsSyncingGas(true);
    try {
      const rows = await fetchGoogleAppsScriptData(savedGasUrl);
      if (rows && rows.length > 0) {
        setNiftyData(rows);
      }
    } catch (err) {
      console.error('Failed to sync Google Apps Script data:', err);
    } finally {
      setIsSyncingGas(false);
    }
  }, [savedGasUrl]);

  // Auto-sync Google Apps Script data on mount if savedGasUrl is available
  useEffect(() => {
    if (savedGasUrl) {
      handleSyncGas();
    }
  }, []);

  // Compute stats on the filtered dataset
  const stats = useMemo(() => computeStats(filteredNiftyData), [filteredNiftyData]);

  const handleImportData = (parsedRows: NiftyDataPoint[], append: boolean) => {
    if (append) {
      setNiftyData(prev => [...prev, ...parsedRows]);
    } else {
      setNiftyData(parsedRows);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset data back to initial NIFTY 50 dataset?')) {
      setNiftyData(INITIAL_NIFTY_DATA);
      handleResetDateRange();
    }
  };

  const handleExportCSV = () => {
    const exportDataset = filteredNiftyData.length > 0 ? filteredNiftyData : niftyData;
    if (exportDataset.length === 0) return;

    const headers = [
      'Index Name',
      'Date',
      'Open',
      'High',
      'Low',
      'Close',
      'Gap %',
      'Gap Type',
      'Open-Close',
      'Day Range'
    ];

    const rows = exportDataset.map(d => [
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
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NIFTY_50_Trading_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        savedGasUrl={savedGasUrl}
        onSyncGas={handleSyncGas}
        isSyncingGas={isSyncingGas}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global Date Range Filter ("From Date" to "To Date") */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          minAvailableDate={minAvailableDate}
          maxAvailableDate={maxAvailableDate}
          totalDaysCount={niftyData.length}
          filteredDaysCount={filteredNiftyData.length}
          onReset={handleResetDateRange}
        />

        {/* Always visible top summary cards */}
        <StatsOverview stats={stats} dataCount={filteredNiftyData.length} />

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <PriceCandlestickChart data={filteredNiftyData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GapAnalysisChart data={filteredNiftyData} stats={stats} />
              <DayRangeVolatilityChart data={filteredNiftyData} stats={stats} />
            </div>

            <DataTable
              data={filteredNiftyData}
              onUpdateData={setNiftyData}
              onOpenImport={() => setIsImportModalOpen(true)}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}

        {activeTab === 'price' && (
          <div className="space-y-6">
            <PriceCandlestickChart data={filteredNiftyData} />
            <DataTable
              data={filteredNiftyData}
              onUpdateData={setNiftyData}
              onOpenImport={() => setIsImportModalOpen(true)}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}

        {activeTab === 'gap' && (
          <div className="space-y-6">
            <GapAnalysisChart data={filteredNiftyData} stats={stats} />
          </div>
        )}

        {activeTab === 'volatility' && (
          <div className="space-y-6">
            <DayRangeVolatilityChart data={filteredNiftyData} stats={stats} />
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-6">
            <DataTable
              data={filteredNiftyData}
              onUpdateData={setNiftyData}
              onOpenImport={() => setIsImportModalOpen(true)}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">NIFTY 50 Interactive Dashboard</span>
          </div>
          <div>
            Showing {filteredNiftyData.length} of {niftyData.length} trading days · Supports Google Sheet Web App & TSV/CSV copy-paste
          </div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
          >
            {savedGasUrl ? 'Google Sheet Config' : 'Connect Google Sheet'}
          </button>
        </div>
      </footer>

      {/* Data Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
        savedGasUrl={savedGasUrl}
        onSaveGasUrl={handleSaveGasUrl}
      />
    </div>
  );
}


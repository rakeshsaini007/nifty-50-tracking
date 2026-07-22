import React, { useState } from 'react';
import { parsePastedData } from '../data/niftySample';
import { fetchGoogleAppsScriptData } from '../data/gasService';
import { NiftyDataPoint } from '../types';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Link,
  Code,
  Copy,
  Check,
  RefreshCw,
  Info,
  Globe
} from 'lucide-react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsed: NiftyDataPoint[], append: boolean) => void;
  savedGasUrl: string;
  onSaveGasUrl: (url: string) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  savedGasUrl,
  onSaveGasUrl
}) => {
  const [activeTab, setActiveTab] = useState<'gas' | 'paste'>('gas');

  // Google Apps Script state
  const [gasUrl, setGasUrl] = useState(savedGasUrl || '');
  const [isFetchingGas, setIsFetchingGas] = useState(false);
  const [gasError, setGasError] = useState('');
  const [gasSuccessMsg, setGasSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  React.useEffect(() => {
    if (savedGasUrl) {
      setGasUrl(savedGasUrl);
    }
  }, [savedGasUrl]);

  // Paste / Upload state
  const [pastedText, setPastedText] = useState('');
  const [appendMode, setAppendMode] = useState(false);
  const [previewData, setPreviewData] = useState<NiftyDataPoint[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFetchGas = async () => {
    if (!gasUrl.trim()) {
      setGasError('Please enter your Google Apps Script Web App Deployment URL.');
      return;
    }

    setIsFetchingGas(true);
    setGasError('');
    setGasSuccessMsg('');

    try {
      const rows = await fetchGoogleAppsScriptData(gasUrl);
      if (rows.length === 0) {
        setGasError('Script executed successfully, but 0 valid data rows were returned.');
      } else {
        onSaveGasUrl(gasUrl.trim());
        onImport(rows, false);
        setGasSuccessMsg(`Successfully fetched ${rows.length} live trading records from Google Sheets!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setGasError(err.message || 'Failed to fetch data from Google Apps Script endpoint.');
    } finally {
      setIsFetchingGas(false);
    }
  };

  const gasCodeSnippet = `/**
 * Google Apps Script for NIFTY 50 Google Sheet Visualizer
 * File: Code.js
 * 
 * Auto-calculates Gap % & Gap Type for any missing values in your Google Sheet!
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    
    if (!data || data.length <= 1) {
      return responseJSON({ status: "success", count: 0, data: [] });
    }
    
    var rawRows = [];
    var startIndex = 1;
    var firstRowStr = String(data[0][0] || "") + String(data[0][1] || "");
    if (!firstRowStr.toLowerCase().includes("date") && !firstRowStr.toLowerCase().includes("index") && !firstRowStr.toLowerCase().includes("nifty")) {
      startIndex = 0;
    }
    
    for (var i = startIndex; i < data.length; i++) {
      var row = data[i];
      if (!row || row.length < 5) continue;
      
      var indexName = "NIFTY 50";
      var dateVal = "";
      var open = 0, high = 0, low = 0, close = 0;
      var gapPercent = null, gapType = "N/A", openCloseReturn = 0, dayRange = 0;
      
      if (String(row[0]).toUpperCase().indexOf("NIFTY") !== -1) {
        indexName = String(row[0]);
        dateVal = parseSheetDate(row[1]);
        open = Number(row[2]) || 0; high = Number(row[3]) || 0;
        low = Number(row[4]) || 0; close = Number(row[5]) || 0;
        gapPercent = (row[6] !== "" && row[6] !== null && !isNaN(row[6])) ? Number(row[6]) : null;
        gapType = String(row[7] || "").trim() || "N/A";
        openCloseReturn = (row[8] !== "" && row[8] !== null && !isNaN(row[8])) ? Number(row[8]) : 0;
        dayRange = (row[9] !== "" && row[9] !== null && !isNaN(row[9])) ? Number(row[9]) : 0;
      } else {
        dateVal = parseSheetDate(row[0]);
        open = Number(row[1]) || 0; high = Number(row[2]) || 0;
        low = Number(row[3]) || 0; close = Number(row[4]) || 0;
        gapPercent = (row[5] !== "" && row[5] !== null && !isNaN(row[5])) ? Number(row[5]) : null;
        gapType = String(row[6] || "").trim() || "N/A";
        openCloseReturn = (row[7] !== "" && row[7] !== null && !isNaN(row[7])) ? Number(row[7]) : 0;
        dayRange = (row[8] !== "" && row[8] !== null && !isNaN(row[8])) ? Number(row[8]) : 0;
      }
      
      if (dateVal && open > 0 && close > 0) {
        rawRows.push({
          indexName: indexName, date: dateVal, open: open, high: high, low: low, close: close,
          gapPercent: gapPercent, gapType: gapType, openCloseReturn: openCloseReturn, dayRange: dayRange
        });
      }
    }

    // Sort chronologically to compute missing Gap % and Gap Type
    rawRows.sort(function(a, b) {
      return (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0);
    });

    for (var k = 0; k < rawRows.length; k++) {
      var r = rawRows[k];
      if (r.dayRange === 0 && r.high >= r.low) r.dayRange = Math.round((r.high - r.low) * 100) / 100;
      if (r.openCloseReturn === 0 && r.open > 0) r.openCloseReturn = Math.round(((r.close - r.open) / r.open) * 10000) / 100;

      // Auto-calculate Gap % from previous close
      if (r.gapPercent === null && k > 0) {
        var prevClose = rawRows[k - 1].close;
        if (prevClose > 0) {
          r.gapPercent = Math.round(((r.open - prevClose) / prevClose) * 10000) / 100;
        }
      }

      // Auto-calculate Gap Type
      if (r.gapType === "N/A" || !r.gapType) {
        if (r.gapPercent !== null && !isNaN(r.gapPercent)) {
          if (r.gapPercent > 0.05) r.gapType = "GapUp";
          else if (r.gapPercent < -0.05) r.gapType = "GapDown";
          else r.gapType = "Flat";
        } else {
          r.gapType = "Flat";
        }
      }
    }

    return responseJSON({ status: "success", count: rawRows.length, data: rawRows });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

/**
 * OPTIONAL: Run autoFillSheetGaps in Apps Script to automatically fill
 * empty Gap % and Gap Type columns directly inside your Google Sheet!
 */
function autoFillSheetGaps() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var isExtended = String(data[0][0]).toUpperCase().indexOf("NIFTY") !== -1;
  var gapColIdx = isExtended ? 6 : 5;
  var typeColIdx = isExtended ? 7 : 6;
  var closeColIdx = isExtended ? 5 : 4;
  var openColIdx = isExtended ? 2 : 1;

  for (var i = 2; i < data.length; i++) {
    var prevClose = Number(data[i - 1][closeColIdx]) || 0;
    var currentOpen = Number(data[i][openColIdx]) || 0;
    
    if (prevClose > 0 && currentOpen > 0) {
      var calcGap = Math.round((((currentOpen - prevClose) / prevClose) * 100) * 100) / 100;
      var existingGap = data[i][gapColIdx];
      if (existingGap === "" || existingGap === null || isNaN(existingGap)) {
        sheet.getRange(i + 1, gapColIdx + 1).setValue(calcGap);
      }
      
      var existingType = String(data[i][typeColIdx] || "").trim();
      if (!existingType || existingType === "N/A") {
        var gType = "Flat";
        if (calcGap > 0.05) gType = "GapUp";
        else if (calcGap < -0.05) gType = "GapDown";
        sheet.getRange(i + 1, typeColIdx + 1).setValue(gType);
      }
    }
  }
}

function parseSheetDate(val) {
  if (!val) return "";
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT", "dd-MMM-yy");
  return String(val).trim();
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyAppsScriptCode = () => {
    navigator.clipboard.writeText(gasCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTextChange = (text: string) => {
    setPastedText(text);
    if (!text.trim()) {
      setPreviewData([]);
      setErrorMsg('');
      return;
    }

    try {
      const parsed = parsePastedData(text);
      setPreviewData(parsed);
      if (parsed.length === 0) {
        setErrorMsg('Could not parse valid rows. Make sure headers or values contain Date, Open, High, Low, Close.');
      } else {
        setErrorMsg('');
      }
    } catch (err: any) {
      setErrorMsg('Failed to parse text: ' + err.message);
      setPreviewData([]);
    }
  };

  const sampleTemplate = `Index Name\tDate\tOpen\tHigh\tLow\tClose\tGap %\tGap Type\tOpen-Close\tDay Range
NIFTY 50\t01-Jan-25\t23637.65\t23822.8\t23562.8\t23742.9\t\t\t0.44526423\t260
NIFTY 50\t02-Jan-25\t23783\t24226.7\t23751.55\t24188.65\t0.168893\tGapUp\t1.70563007\t475.15`;

  const handleApplySample = () => {
    setPastedText(sampleTemplate);
    handleTextChange(sampleTemplate);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content) {
          setPastedText(content);
          handleTextChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (previewData.length > 0) {
      onImport(previewData, appendMode);
      onClose();
      setPastedText('');
      setPreviewData([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Google Sheets Data Source</h3>
              <p className="text-xs text-slate-400">Connect via Google Apps Script Web App URL or paste raw sheet rows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3">
          <button
            onClick={() => setActiveTab('gas')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'gas'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Google Apps Script Web App URL</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Paste / Upload Sheet Rows</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'gas' ? (
            <div className="space-y-4">
              {/* URL Input Box */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 flex items-center justify-between">
                  <span>Google Apps Script Web App Deployment URL:</span>
                  <button
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="text-indigo-600 hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{showCodePreview ? 'Hide Script Code' : 'View code.js Script'}</span>
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={handleFetchGas}
                    disabled={isFetchingGas || !gasUrl.trim()}
                    className={`px-4 py-2.5 rounded-xl font-bold text-white transition flex items-center gap-1.5 shadow-md shrink-0 ${
                      isFetchingGas || !gasUrl.trim()
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-indigo-500/20'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingGas ? 'animate-spin' : ''}`} />
                    <span>{isFetchingGas ? 'Fetching...' : 'Fetch Live Data'}</span>
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {gasError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Error fetching Google Apps Script:</span>
                    <span className="text-xs">{gasError}</span>
                  </div>
                </div>
              )}

              {gasSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{gasSuccessMsg}</span>
                </div>
              )}

              {/* Code Preview Section */}
              {showCodePreview && (
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">code.js (Google Apps Script)</span>
                    <button
                      onClick={copyAppsScriptCode}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy code.js'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto max-h-48 text-slate-300 p-1">
                    {gasCodeSnippet}
                  </pre>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-slate-700 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>How to connect your Google Sheet named "Data":</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                  <li>In your Google Sheet, click <strong>Extensions → Apps Script</strong>.</li>
                  <li>
                    Copy the code from <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">code.js</code> (or click 'View code.js Script' above) and paste into <strong>Code.gs</strong>.
                  </li>
                  <li>Click <strong>Deploy → New deployment</strong>.</li>
                  <li>Select <strong>Web app</strong>, set Execute as: <strong>Me</strong>, and Who has access: <strong>Anyone</strong>.</li>
                  <li>Click <strong>Deploy</strong>, grant permissions, and copy the Web App URL.</li>
                  <li>Paste the deployment URL in the box above and click <strong>Fetch Live Data</strong>!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File upload or sample trigger */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload CSV File</span>
                    <input type="file" accept=".csv, .tsv, .txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={handleApplySample}
                    className="text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    Insert Sample Format
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-slate-600 font-medium cursor-pointer flex items-center gap-1.5 select-none">
                    <input
                      type="checkbox"
                      checked={appendMode}
                      onChange={(e) => setAppendMode(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Append to current dataset</span>
                  </label>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Paste Copied Sheet Rows (TSV / CSV):
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`Index Name\tDate\tOpen\tHigh\tLow\tClose\tGap %\tGap Type\tOpen-Close\tDay Range\nNIFTY 50\t01-Jan-25\t23637.65\t23822.8\t23562.8\t23742.9\t\t\t0.44526423\t260`}
                  className="w-full p-3 font-mono bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs leading-relaxed"
                />
              </div>

              {/* Parse Status / Feedback */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">
                      Successfully parsed {previewData.length} trading row{previewData.length > 1 ? 's' : ''}!
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Range: {previewData[0]?.date} → {previewData[previewData.length - 1]?.date}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {activeTab === 'gas' && savedGasUrl ? (
              <span className="text-emerald-700 font-medium">Saved Web App URL active</span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Close
            </button>
            {activeTab === 'paste' && (
              <button
                onClick={handleConfirmImport}
                disabled={previewData.length === 0}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition flex items-center gap-1.5 shadow-md ${
                  previewData.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-indigo-500/20'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply {previewData.length > 0 ? `${previewData.length} Rows` : 'Data'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { NiftyDataPoint } from '../types';
import { parseDateToISO } from './niftySample';

export interface GasResponse {
  status: 'success' | 'error';
  data?: any[];
  count?: number;
  message?: string;
}

/**
 * Fetches JSON trading data directly from a Google Apps Script Web App Deployment URL
 * and automatically computes missing Gap % and Gap Type values.
 */
export async function fetchGoogleAppsScriptData(scriptUrl: string): Promise<NiftyDataPoint[]> {
  let cleanUrl = scriptUrl.trim();
  if (!cleanUrl) {
    throw new Error('Please enter a valid Google Apps Script Web App URL.');
  }

  // Ensure redirect handling works for Google Apps Script Web Apps
  const response = await fetch(cleanUrl, {
    method: 'GET',
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status}. Check your script deployment permissions.`);
  }

  const json: GasResponse = await response.json();

  if (json.status === 'error') {
    throw new Error(json.message || 'Google Apps Script returned an error.');
  }

  const rawRows = json.data || (Array.isArray(json) ? json : []);
  if (!Array.isArray(rawRows)) {
    throw new Error('Unexpected data format received from Google Apps Script.');
  }

  const result: NiftyDataPoint[] = [];

  rawRows.forEach((row: any, idx: number) => {
    let indexName = row.indexName || row['Index Name'] || 'NIFTY 50';
    let date = row.date || row['Date'] || '';
    let open = Number(row.open || row['Open']) || 0;
    let high = Number(row.high || row['High']) || 0;
    let low = Number(row.low || row['Low']) || 0;
    let close = Number(row.close || row['Close']) || 0;
    
    let gapPercentRaw = row.gapPercent !== undefined ? row.gapPercent : row['Gap %'];
    let gapPercent: number | null = gapPercentRaw !== '' && gapPercentRaw !== null && !isNaN(Number(gapPercentRaw)) 
      ? Number(gapPercentRaw) 
      : null;

    let gapTypeRaw = row.gapType || row['Gap Type'] || '';
    let gapType: 'GapUp' | 'GapDown' | 'Flat' | 'N/A' = 'N/A';
    if (gapTypeRaw === 'GapUp' || gapTypeRaw === 'GapDown' || gapTypeRaw === 'Flat') {
      gapType = gapTypeRaw;
    } else if (gapPercent !== null) {
      if (gapPercent > 0.05) gapType = 'GapUp';
      else if (gapPercent < -0.05) gapType = 'GapDown';
      else gapType = 'Flat';
    }

    let openCloseReturnRaw = row.openCloseReturn !== undefined ? row.openCloseReturn : row['Open-Close'];
    let openCloseReturn = Number(openCloseReturnRaw) || 0;
    if (openCloseReturn === 0 && open > 0) {
      openCloseReturn = Math.round(((close - open) / open) * 10000) / 100;
    }

    let dayRangeRaw = row.dayRange !== undefined ? row.dayRange : row['Day Range'];
    let dayRange = Number(dayRangeRaw) || (high - low);
    if (dayRange === 0 && high >= low) {
      dayRange = Math.round((high - low) * 100) / 100;
    }

    if (date && open > 0 && close > 0) {
      result.push({
        id: `gas-${idx}-${Date.now()}`,
        indexName,
        date: String(date),
        parsedDate: parseDateToISO(String(date)),
        open,
        high,
        low,
        close,
        gapPercent,
        gapType,
        openCloseReturn,
        dayRange,
        isGreen: close >= open
      });
    }
  });

  // Sort chronologically by parsedDate
  result.sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));

  // Automatically calculate missing Gap % and Gap Type across all rows
  for (let k = 0; k < result.length; k++) {
    const r = result[k];

    // Compute Gap % from previous day's close if missing
    if (r.gapPercent === null && k > 0) {
      const prevClose = result[k - 1].close;
      if (prevClose > 0) {
        r.gapPercent = Math.round(((r.open - prevClose) / prevClose) * 10000) / 100;
      }
    }

    // Compute Gap Type from Gap % if missing or N/A
    if (r.gapType === 'N/A' || !r.gapType) {
      if (r.gapPercent !== null && !isNaN(r.gapPercent)) {
        if (r.gapPercent > 0.05) {
          r.gapType = 'GapUp';
        } else if (r.gapPercent < -0.05) {
          r.gapType = 'GapDown';
        } else {
          r.gapType = 'Flat';
        }
      } else {
        r.gapType = 'Flat';
      }
    }
  }

  return result;
}

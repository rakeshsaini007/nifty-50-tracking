import { NiftyDataPoint, SummaryStats } from '../types';

export const INITIAL_NIFTY_DATA: NiftyDataPoint[] = [
  {
    id: '1',
    indexName: 'NIFTY 50',
    date: '01-Jan-25',
    parsedDate: '2025-01-01',
    open: 23637.65,
    high: 23822.8,
    low: 23562.8,
    close: 23742.9,
    gapPercent: null,
    gapType: 'N/A',
    openCloseReturn: 0.44526423,
    dayRange: 260,
    isGreen: true
  },
  {
    id: '2',
    indexName: 'NIFTY 50',
    date: '02-Jan-25',
    parsedDate: '2025-01-02',
    open: 23783,
    high: 24226.7,
    low: 23751.55,
    close: 24188.65,
    gapPercent: 0.168893,
    gapType: 'GapUp',
    openCloseReturn: 1.70563007,
    dayRange: 475.15,
    isGreen: true
  },
  {
    id: '3',
    indexName: 'NIFTY 50',
    date: '03-Jan-25',
    parsedDate: '2025-01-03',
    open: 24196.4,
    high: 24196.45,
    low: 23976,
    close: 24004.75,
    gapPercent: 0.03204,
    gapType: 'GapUp',
    openCloseReturn: -0.79206,
    dayRange: 220.45,
    isGreen: false
  },
  {
    id: '4',
    indexName: 'NIFTY 50',
    date: '06-Jan-25',
    parsedDate: '2025-01-06',
    open: 24045.8,
    high: 24089.95,
    low: 23551.9,
    close: 23616.05,
    gapPercent: 0.171008,
    gapType: 'GapUp',
    openCloseReturn: -1.7872144,
    dayRange: 538.05,
    isGreen: false
  },
  {
    id: '5',
    indexName: 'NIFTY 50',
    date: '07-Jan-25',
    parsedDate: '2025-01-07',
    open: 23679.9,
    high: 23795.2,
    low: 23637.8,
    close: 23707.9,
    gapPercent: 0.270367,
    gapType: 'GapUp',
    openCloseReturn: 0.11824374,
    dayRange: 157.4,
    isGreen: true
  },
  {
    id: '6',
    indexName: 'NIFTY 50',
    date: '08-Jan-25',
    parsedDate: '2025-01-08',
    open: 23746.65,
    high: 23751.85,
    low: 23496.15,
    close: 23688.95,
    gapPercent: 0.163448,
    gapType: 'GapUp',
    openCloseReturn: -0.2429816,
    dayRange: 255.7,
    isGreen: false
  },
  {
    id: '7',
    indexName: 'NIFTY 50',
    date: '09-Jan-25',
    parsedDate: '2025-01-09',
    open: 23674.75,
    high: 23689.5,
    low: 23503.05,
    close: 23526.5,
    gapPercent: -0.05994,
    gapType: 'GapDown',
    openCloseReturn: -0.6261946,
    dayRange: 186.45,
    isGreen: false
  },
  {
    id: '8',
    indexName: 'NIFTY 50',
    date: '10-Jan-25',
    parsedDate: '2025-01-10',
    open: 23551.9,
    high: 23596.6,
    low: 23344.35,
    close: 23431.5,
    gapPercent: 0.107963,
    gapType: 'GapUp',
    openCloseReturn: -0.5112114,
    dayRange: 252.25,
    isGreen: false
  },
  {
    id: '9',
    indexName: 'NIFTY 50',
    date: '13-Jan-25',
    parsedDate: '2025-01-13',
    open: 23195.4,
    high: 23340.95,
    low: 23047.25,
    close: 23085.95,
    gapPercent: -1.00762,
    gapType: 'GapDown',
    openCloseReturn: -0.4718608,
    dayRange: 293.7,
    isGreen: false
  },
  {
    id: '10',
    indexName: 'NIFTY 50',
    date: '14-Jan-25',
    parsedDate: '2025-01-14',
    open: 23165.9,
    high: 23264.95,
    low: 23134.15,
    close: 23176.05,
    gapPercent: 0.346315,
    gapType: 'GapUp',
    openCloseReturn: 0.0438144,
    dayRange: 130.8,
    isGreen: true
  },
  {
    id: '11',
    indexName: 'NIFTY 50',
    date: '15-Jan-25',
    parsedDate: '2025-01-15',
    open: 23250.45,
    high: 23293.65,
    low: 23146.45,
    close: 23213.2,
    gapPercent: 0.321021,
    gapType: 'GapUp',
    openCloseReturn: -0.160212,
    dayRange: 147.2,
    isGreen: false
  },
  {
    id: '12',
    indexName: 'NIFTY 50',
    date: '16-Jan-25',
    parsedDate: '2025-01-16',
    open: 23377.25,
    high: 23391.65,
    low: 23272.05,
    close: 23311.8,
    gapPercent: 0.70671,
    gapType: 'GapUp',
    openCloseReturn: -0.2799731,
    dayRange: 119.6,
    isGreen: false
  },
  {
    id: '13',
    indexName: 'NIFTY 50',
    date: '17-Jan-25',
    parsedDate: '2025-01-17',
    open: 23311.8,
    high: 23292.1,
    low: 23100.35,
    close: 23203.2,
    gapPercent: 0,
    gapType: 'Flat',
    openCloseReturn: -0.4658585,
    dayRange: 191.75,
    isGreen: false
  },
  {
    id: '14',
    indexName: 'NIFTY 50',
    date: '20-Jan-25',
    parsedDate: '2025-01-20',
    open: 23220.5,
    high: 23380.1,
    low: 23180.2,
    close: 23344.7,
    gapPercent: 0.074558,
    gapType: 'GapUp',
    openCloseReturn: 0.534872,
    dayRange: 199.9,
    isGreen: true
  },
  {
    id: '15',
    indexName: 'NIFTY 50',
    date: '21-Jan-25',
    parsedDate: '2025-01-21',
    open: 23310.0,
    high: 23415.5,
    low: 23150.0,
    close: 23215.3,
    gapPercent: -0.148642,
    gapType: 'GapDown',
    openCloseReturn: -0.406263,
    dayRange: 265.5,
    isGreen: false
  },
  {
    id: '16',
    indexName: 'NIFTY 50',
    date: '22-Jan-25',
    parsedDate: '2025-01-22',
    open: 23280.2,
    high: 23490.8,
    low: 23220.1,
    close: 23438.9,
    gapPercent: 0.279536,
    gapType: 'GapUp',
    openCloseReturn: 0.681695,
    dayRange: 270.7,
    isGreen: true
  },
  {
    id: '17',
    indexName: 'NIFTY 50',
    date: '23-Jan-25',
    parsedDate: '2025-01-23',
    open: 23510.0,
    high: 23620.4,
    low: 23450.0,
    close: 23580.6,
    gapPercent: 0.303342,
    gapType: 'GapUp',
    openCloseReturn: 0.300298,
    dayRange: 170.4,
    isGreen: true
  },
  {
    id: '18',
    indexName: 'NIFTY 50',
    date: '24-Jan-25',
    parsedDate: '2025-01-24',
    open: 23550.8,
    high: 23590.2,
    low: 23310.5,
    close: 23350.2,
    gapPercent: -0.126375,
    gapType: 'GapDown',
    openCloseReturn: -0.851776,
    dayRange: 279.7,
    isGreen: false
  },
  {
    id: '19',
    indexName: 'NIFTY 50',
    date: '27-Jan-25',
    parsedDate: '2025-01-27',
    open: 23320.0,
    high: 23440.0,
    low: 23190.0,
    close: 23245.5,
    gapPercent: -0.129335,
    gapType: 'GapDown',
    openCloseReturn: -0.319468,
    dayRange: 250.0,
    isGreen: false
  },
  {
    id: '20',
    indexName: 'NIFTY 50',
    date: '28-Jan-25',
    parsedDate: '2025-01-28',
    open: 23310.5,
    high: 23500.2,
    low: 23280.0,
    close: 23465.1,
    gapPercent: 0.279624,
    gapType: 'GapUp',
    openCloseReturn: 0.663219,
    dayRange: 220.2,
    isGreen: true
  }
];

export function parseDateToISO(dateStr: string): string {
  if (!dateStr) return '2025-01-01';
  const parts = dateStr.trim().split(/[-/]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthStr = parts[1].toLowerCase();
    let year = parts[2];
    if (year.length === 2) year = '20' + year;

    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
      '01': '01', '02': '02', '03': '03', '04': '04', '05': '05', '06': '06',
      '07': '07', '08': '08', '09': '09', '10': '10', '11': '11', '12': '12'
    };

    const month = monthMap[monthStr.substring(0, 3)] || '01';
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

export function parsePastedData(text: string): NiftyDataPoint[] {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const results: NiftyDataPoint[] = [];

  // Check if first line is header
  let startIndex = 0;
  const firstLineLower = lines[0].toLowerCase();
  if (firstLineLower.includes('date') || firstLineLower.includes('open') || firstLineLower.includes('close')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    // split by tab or multiple spaces or comma
    const cols = rawLine.split(/\t|,| {2,}/).map(c => c.trim().replace(/^"|"$/g, ''));

    if (cols.length < 5) continue; // need at least Date, Open, High, Low, Close or Index, Date...

    let indexName = 'NIFTY 50';
    let date = '';
    let open = 0;
    let high = 0;
    let low = 0;
    let close = 0;
    let gapPercent: number | null = null;
    let gapType: 'GapUp' | 'GapDown' | 'Flat' | 'N/A' = 'N/A';
    let openCloseReturn = 0;
    let dayRange = 0;

    // Detect format
    if (isNaN(Number(cols[0])) && cols[0].toUpperCase().includes('NIFTY')) {
      // Index Name present as col 0
      indexName = cols[0];
      date = cols[1] || '';
      open = parseFloat(cols[2]) || 0;
      high = parseFloat(cols[3]) || 0;
      low = parseFloat(cols[4]) || 0;
      close = parseFloat(cols[5]) || 0;
      gapPercent = cols[6] !== undefined && cols[6] !== '' ? parseFloat(cols[6]) : null;
      if (cols[7]) {
        const gt = cols[7].trim();
        if (gt === 'GapUp' || gt === 'GapDown' || gt === 'Flat') {
          gapType = gt as any;
        }
      }
      if (cols[8] !== undefined && cols[8] !== '') {
        openCloseReturn = parseFloat(cols[8]);
      } else if (open > 0) {
        openCloseReturn = ((close - open) / open) * 100;
      }
      if (cols[9] !== undefined && cols[9] !== '') {
        dayRange = parseFloat(cols[9]);
      } else {
        dayRange = high - low;
      }
    } else {
      // Date is col 0
      date = cols[0] || '';
      open = parseFloat(cols[1]) || 0;
      high = parseFloat(cols[2]) || 0;
      low = parseFloat(cols[3]) || 0;
      close = parseFloat(cols[4]) || 0;
      if (cols[5] !== undefined && cols[5] !== '') gapPercent = parseFloat(cols[5]);
      if (cols[6]) {
        const gt = cols[6].trim();
        if (gt === 'GapUp' || gt === 'GapDown' || gt === 'Flat') gapType = gt as any;
      }
      if (cols[7] !== undefined && cols[7] !== '') openCloseReturn = parseFloat(cols[7]);
      else if (open > 0) openCloseReturn = ((close - open) / open) * 100;
      if (cols[8] !== undefined && cols[8] !== '') dayRange = parseFloat(cols[8]);
      else dayRange = high - low;
    }

    if (date && open > 0 && close > 0) {
      if (dayRange === 0 && high >= low) dayRange = Math.round((high - low) * 100) / 100;
      if (gapType === 'N/A' && gapPercent !== null) {
        if (gapPercent > 0.05) gapType = 'GapUp';
        else if (gapPercent < -0.05) gapType = 'GapDown';
        else gapType = 'Flat';
      }

      results.push({
        id: `parsed-${i}-${Date.now()}`,
        indexName,
        date,
        parsedDate: parseDateToISO(date),
        open,
        high,
        low,
        close,
        gapPercent: gapPercent !== null && !isNaN(gapPercent) ? gapPercent : null,
        gapType,
        openCloseReturn: !isNaN(openCloseReturn) ? openCloseReturn : 0,
        dayRange: !isNaN(dayRange) ? dayRange : high - low,
        isGreen: close >= open
      });
    }
  }

  // Sort chronologically to accurately calculate missing Gap % and Gap Type
  results.sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));

  for (let k = 0; k < results.length; k++) {
    const r = results[k];

    // Compute Gap % from previous day's close if missing
    if (r.gapPercent === null && k > 0) {
      const prevClose = results[k - 1].close;
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

  return results;
}

export function computeStats(data: NiftyDataPoint[]): SummaryStats {
  if (data.length === 0) {
    return {
      totalDays: 0,
      latestClose: 0,
      firstOpen: 0,
      totalChange: 0,
      totalChangePercent: 0,
      highestPrice: 0,
      lowestPrice: 0,
      avgDayRange: 0,
      greenDaysCount: 0,
      redDaysCount: 0,
      gapUpCount: 0,
      gapDownCount: 0,
      flatCount: 0,
      avgGapUpPercent: 0,
      avgGapDownPercent: 0,
      avgGreenReturn: 0,
      avgRedReturn: 0
    };
  }

  const sorted = [...data].sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));
  const firstOpen = sorted[0].open;
  const latestClose = sorted[sorted.length - 1].close;
  const totalChange = latestClose - firstOpen;
  const totalChangePercent = (totalChange / firstOpen) * 100;

  let highestPrice = -Infinity;
  let lowestPrice = Infinity;
  let totalDayRange = 0;
  let greenCount = 0;
  let redCount = 0;
  let gapUpCount = 0;
  let gapDownCount = 0;
  let flatCount = 0;

  let totalGapUp = 0;
  let totalGapDown = 0;
  let totalGreenReturn = 0;
  let totalRedReturn = 0;

  data.forEach(d => {
    if (d.high > highestPrice) highestPrice = d.high;
    if (d.low < lowestPrice) lowestPrice = d.low;
    totalDayRange += d.dayRange;

    if (d.isGreen) {
      greenCount++;
      totalGreenReturn += d.openCloseReturn;
    } else {
      redCount++;
      totalRedReturn += d.openCloseReturn;
    }

    if (d.gapType === 'GapUp') {
      gapUpCount++;
      if (d.gapPercent) totalGapUp += d.gapPercent;
    } else if (d.gapType === 'GapDown') {
      gapDownCount++;
      if (d.gapPercent) totalGapDown += d.gapPercent;
    } else if (d.gapType === 'Flat') {
      flatCount++;
    }
  });

  return {
    totalDays: data.length,
    latestClose,
    firstOpen,
    totalChange,
    totalChangePercent,
    highestPrice: highestPrice === -Infinity ? 0 : highestPrice,
    lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice,
    avgDayRange: totalDayRange / data.length,
    greenDaysCount: greenCount,
    redDaysCount: redCount,
    gapUpCount,
    gapDownCount,
    flatCount,
    avgGapUpPercent: gapUpCount > 0 ? totalGapUp / gapUpCount : 0,
    avgGapDownPercent: gapDownCount > 0 ? totalGapDown / gapDownCount : 0,
    avgGreenReturn: greenCount > 0 ? totalGreenReturn / greenCount : 0,
    avgRedReturn: redCount > 0 ? totalRedReturn / redCount : 0
  };
}

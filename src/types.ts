export interface NiftyDataPoint {
  id: string;
  indexName: string;
  date: string; // e.g. "01-Jan-25"
  parsedDate: string; // YYYY-MM-DD for sorting
  open: number;
  high: number;
  low: number;
  close: number;
  gapPercent: number | null; // percentage e.g. 0.168893
  gapType: 'GapUp' | 'GapDown' | 'Flat' | 'N/A';
  openCloseReturn: number; // percentage change between open and close
  dayRange: number; // High - Low
  isGreen: boolean; // close >= open
}

export type ViewTab = 'overview' | 'price' | 'gap' | 'volatility' | 'table';

export interface SummaryStats {
  totalDays: number;
  latestClose: number;
  firstOpen: number;
  totalChange: number;
  totalChangePercent: number;
  highestPrice: number;
  lowestPrice: number;
  avgDayRange: number;
  greenDaysCount: number;
  redDaysCount: number;
  gapUpCount: number;
  gapDownCount: number;
  flatCount: number;
  avgGapUpPercent: number;
  avgGapDownPercent: number;
  avgGreenReturn: number;
  avgRedReturn: number;
}

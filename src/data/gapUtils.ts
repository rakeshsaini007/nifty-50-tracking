import { NiftyDataPoint } from '../types';
import { DirectionFilter, FilterMode, FilterMetric, GAP_THRESHOLDS } from '../components/GapMoveFilter';

export function filterDataByMetric(
  data: NiftyDataPoint[],
  threshold: number,
  direction: DirectionFilter = 'all',
  mode: FilterMode = 'min',
  metric: FilterMetric = 'openClose'
): NiftyDataPoint[] {
  if (threshold === 0 && direction === 'all') {
    return data;
  }

  const thresholdsList: number[] = [...GAP_THRESHOLDS, Infinity];

  return data.filter(item => {
    let val: number | null = null;
    if (metric === 'openClose') {
      val = item.openCloseReturn !== undefined && item.openCloseReturn !== null && !isNaN(item.openCloseReturn)
        ? item.openCloseReturn
        : null;
    } else {
      val = item.gapPercent !== undefined && item.gapPercent !== null && !isNaN(item.gapPercent)
        ? item.gapPercent
        : null;
    }

    if (val === null) {
      return false;
    }

    const absVal = Math.abs(val);

    // Direction check
    if (direction === 'up' && val < 0) return false;
    if (direction === 'down' && val > 0) return false;

    if (threshold === 0) return true;

    if (mode === 'min') {
      return absVal >= threshold;
    } else {
      // Find range upper bound
      const idx = thresholdsList.indexOf(threshold);
      const nextThreshold = idx !== -1 && idx < thresholdsList.length - 1 ? thresholdsList[idx + 1] : Infinity;
      return absVal >= threshold && absVal < nextThreshold;
    }
  });
}

export function filterDataByGapMove(
  data: NiftyDataPoint[],
  threshold: number,
  direction: DirectionFilter = 'all',
  mode: FilterMode = 'min',
  metric: FilterMetric = 'openClose'
): NiftyDataPoint[] {
  return filterDataByMetric(data, threshold, direction, mode, metric);
}

export interface GapMoveSummaryStats {
  count: number;
  greenDays: number;
  redDays: number;
  winRate: number; // percentage
  avgGapPercent: number;
  avgIntradayReturn: number;
  avgDayRange: number;
  maxGapUp: number;
  maxGapDown: number;
}

export function computeGapMoveStats(data: NiftyDataPoint[]): GapMoveSummaryStats {
  if (data.length === 0) {
    return {
      count: 0,
      greenDays: 0,
      redDays: 0,
      winRate: 0,
      avgGapPercent: 0,
      avgIntradayReturn: 0,
      avgDayRange: 0,
      maxGapUp: 0,
      maxGapDown: 0
    };
  }

  let greenDays = 0;
  let redDays = 0;
  let totalGap = 0;
  let totalReturn = 0;
  let totalRange = 0;
  let maxGapUp = 0;
  let maxGapDown = 0;

  data.forEach(d => {
    if (d.isGreen) greenDays++;
    else redDays++;

    const g = d.gapPercent || 0;
    totalGap += g;
    totalReturn += d.openCloseReturn || 0;
    totalRange += d.dayRange || 0;

    if (g > maxGapUp) maxGapUp = g;
    if (g < maxGapDown) maxGapDown = g;
  });

  const count = data.length;

  return {
    count,
    greenDays,
    redDays,
    winRate: Math.round((greenDays / count) * 1000) / 10,
    avgGapPercent: Math.round((totalGap / count) * 100) / 100,
    avgIntradayReturn: Math.round((totalReturn / count) * 100) / 100,
    avgDayRange: Math.round((totalRange / count) * 100) / 100,
    maxGapUp: Math.round(maxGapUp * 100) / 100,
    maxGapDown: Math.round(maxGapDown * 100) / 100
  };
}

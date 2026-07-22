import { NiftyDataPoint } from '../types';
import { DirectionFilter, FilterMode, GAP_THRESHOLDS } from '../components/GapMoveFilter';

export function filterDataByGapMove(
  data: NiftyDataPoint[],
  threshold: number,
  direction: DirectionFilter = 'all',
  mode: FilterMode = 'min'
): NiftyDataPoint[] {
  if (threshold === 0 && direction === 'all') {
    return data;
  }

  const thresholdsList: number[] = [...GAP_THRESHOLDS, Infinity];

  return data.filter(item => {
    if (item.gapPercent === null || isNaN(item.gapPercent)) {
      return false;
    }

    const gapVal = item.gapPercent;
    const absGap = Math.abs(gapVal);

    // Direction check
    if (direction === 'up' && gapVal < 0) return false;
    if (direction === 'down' && gapVal > 0) return false;

    if (threshold === 0) return true;

    if (mode === 'min') {
      return absGap >= threshold;
    } else {
      // Find range upper bound
      const idx = thresholdsList.indexOf(threshold);
      const nextThreshold = idx !== -1 && idx < thresholdsList.length - 1 ? thresholdsList[idx + 1] : Infinity;
      return absGap >= threshold && absGap < nextThreshold;
    }
  });
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

import { startOfDay, subDays } from 'date-fns';
import type { WorkoutSet } from '../../types';
import type { TimeFilterMode } from '../storage/localStorage';
import { isPlausibleDate } from './dateFormatting';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const getRollingWindowDaysForMode = (mode: TimeFilterMode): number | null => {
  if (mode === 'weekly') return 7;
  if (mode === 'monthly') return 30;
  if (mode === 'yearly') return 365;
  return null;
};

export const getRollingWindowStartForMode = (mode: TimeFilterMode, now: Date): Date | null => {
  // For trend charts, show the current rolling window AND the previous window.
  // This keeps charts aligned with the "vs prev" deltas (rolling windows) while
  // giving users enough context to validate what they're seeing.
  //
  // weekly  => last 14 days (current 7d + previous 7d)
  // monthly => last 60 days (current 30d + previous 30d)
  // yearly  => last 730 days (current 365d + previous 365d)
  if (mode === 'weekly') return startOfDay(subDays(now, 13));
  if (mode === 'monthly') return startOfDay(subDays(now, 59));
  if (mode === 'yearly') return startOfDay(subDays(now, 729));
  return null;
};

export type ChartAggregation = 'daily' | 'weekly' | 'monthly';

// Target max plotted points for time-series charts.
// Lower values force more aggressive bucketing (fewer points).
export const DEFAULT_CHART_MAX_POINTS = 5;

export const pickChartAggregation = (args: {
  /** earliest timestamp (ms) */
  minTs: number;
  /** latest timestamp (ms) */
  maxTs: number;
  /** preferred granularity (used when it fits) */
  preferred: ChartAggregation;
  /** hard cap for plotted points */
  maxPoints: number;
  /** floor: never collapse below this many points when a finer level exists */
  minPoints?: number;
}): ChartAggregation => {
  const { minTs, maxTs, preferred, maxPoints, minPoints = 3 } = args;

  if (!Number.isFinite(minTs) || !Number.isFinite(maxTs) || maxTs <= minTs) return preferred;

  const msPerDay = 24 * 60 * 60 * 1000;
  const spanDays = Math.max(1, Math.floor((maxTs - minTs) / msPerDay) + 1);

  const estimatePoints = (agg: ChartAggregation) => {
    if (agg === 'daily') return spanDays;
    if (agg === 'weekly') return Math.ceil(spanDays / 7);
    return Math.ceil(spanDays / 30);
  };

  const order: ChartAggregation[] = ['daily', 'weekly', 'monthly'];
  const startIdx = Math.max(0, order.indexOf(preferred));

  for (let i = startIdx; i < order.length; i += 1) {
    const candidate = order[i];
    if (estimatePoints(candidate) <= maxPoints) {
      if (estimatePoints(candidate) < minPoints && i > 0) {
        return order[i - 1];
      }
      return candidate;
    }
  }

  return 'monthly';
};

/**
 * Uniformly downsample an array to at most maxPoints entries.
 * Picks evenly spaced entries so the first and last are always included.
 * Returns the original array unchanged if it's already within the limit.
 */
export const uniformDownsample = <T>(data: T[], maxPoints: number): T[] => {
  if (!Array.isArray(data) || data.length <= maxPoints) return data;
  const step = (data.length - 1) / (maxPoints - 1);
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.round(i * step)]);
  }
  return result;
};

export const formatRollingWindowAbbrev = (days: number): string => {
  if (days === 7) return 'wk';
  if (days === 30) return 'mo';
  if (days === 365) return 'yr';
  return `${days}d`;
};

export const formatVsPrevRollingWindow = (days: number): string => {
  return `vs prev ${formatRollingWindowAbbrev(days)}`;
};

export const formatLastRollingWindow = (days: number): string => {
  if (days === 7) return 'Last Week';
  if (days === 30) return 'Last Month';
  if (days === 365) return 'Last Year';
  return `Last ${days}d`;
};

export const getEffectiveNowFromWorkoutData = (
  data: WorkoutSet[],
  fallbackNow: Date = new Date(0)
): Date => {
  let maxTs = -Infinity;
  for (const s of data) {
    const d = s.parsedDate;
    if (!d) continue;
    if (!isPlausibleDate(d)) continue;
    const ts = d.getTime();
    if (ts > maxTs) maxTs = ts;
  }
  return Number.isFinite(maxTs) ? new Date(maxTs) : fallbackNow;
};

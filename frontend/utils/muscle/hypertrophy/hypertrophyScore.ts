/**
 * Hypertrophy Score Calculation
 *
 * 3-factor formula:
 * - Volume (V): 50% - Weekly sets → possible gains % (diminishing returns model)
 * - Progress (P): 40% - Per-exercise strength trend, weighted by set distribution
 * - Frequency (F): 10% - Training days per week per muscle
 *
 * Formula: Total = V×0.50 + P×0.40 + F×0.10
 * Each factor normalized 0-100, then weighted into final 0-100 score.
 */

import type { WorkoutSet } from '../../../types';
import type { ExerciseAsset } from '../../data/exerciseAssets';
import { calculateEpley1RM } from '../../analysis/masterAlgorithm/masterAlgorithmMath';
import { isWarmupSet } from '../../analysis/classification';
import { getMuscleContributionsFromAsset } from '../analytics/muscleContributions';
import { getVolumeThresholds, type TrainingLevel } from './muscleParams';
import { weeklyStimulusFromThresholds } from './hypertrophyCalculations';
import { lookupAsset, getLowerMap } from '../analytics/muscleAnalyticsHelpers';
import { CSV_TO_SVG_MUSCLE_MAP_LOWERCASE } from '../mapping/muscleCsvMappings';
import { DETAILED_SVG_ID_TO_MUSCLE_ID } from '../mapping/muscleSvgMappings';
import { MUSCLE_NAMES, type MuscleId } from '../mapping/muscleHeadless';

/**
 * Map a raw muscle name (from exercise assets) to headless MuscleIds.
 * Uses the same CSV → SVG → MuscleId chain as the lifetime achievement view.
 */
function getMuscleIdsFromRawName(rawMuscle: string): MuscleId[] {
  const lower = rawMuscle.toLowerCase().trim();
  const svgIds = CSV_TO_SVG_MUSCLE_MAP_LOWERCASE[lower];
  if (!svgIds) return [];
  
  const muscleIds = new Set<MuscleId>();
  for (const svgId of svgIds) {
    const muscleId = DETAILED_SVG_ID_TO_MUSCLE_ID[svgId];
    if (muscleId) {
      muscleIds.add(muscleId);
    }
  }
  return Array.from(muscleIds);
}

// ============================================================================
// Types
// ============================================================================

export interface HypertrophyFactorScores {
  /** Volume Score (0-100) - weekly sets vs MEV/MRV */
  volumeScore: number;
  /** Progressive Overload (0-100) - % change in avg 1RM */
  progressiveOverload: number;
  /** Frequency (0-100) - days per week vs optimal */
  frequency: number;
}

export interface HypertrophyScoreResult extends HypertrophyFactorScores {
  /** Total weighted score (0-100) */
  totalScore: number;
  /** Raw data for debugging */
  raw: {
    weeklySets: number;
    avgOneRM: number;
    oneRMTrend: number;
    daysPerWeek: number;
  };
}

export interface MuscleHypertrophyData {
  muscleId: string;
  muscleName: string;
  score: HypertrophyScoreResult;
}

// ============================================================================
// Constants
// ============================================================================

/** Factor weights (must sum to 1.0) */
export const FACTOR_WEIGHTS = {
  volumeScore: 0.50,
  progressiveOverload: 0.40,
  frequency: 0.10,
} as const;

/** Color coding for each factor */
export const FACTOR_COLORS = {
  volumeScore: '#22c55e',      // Green - most important
  progressiveOverload: '#3b82f6', // Blue - progression
  frequency: '#f59e0b',       // Amber - frequency
} as const;

/** Factor labels for display */
export const FACTOR_LABELS = {
  volumeScore: 'Volume',
  progressiveOverload: 'Progress',
  frequency: 'Frequency',
} as const;

/** Optimal frequency reference (days per week) */
const OPTIMAL_FREQUENCY = 2.5;

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate Volume Score (0-100)
 * Based on weekly sets vs MEV/MRV thresholds
 */
export function calculateVolumeScore(weeklySets: number, trainingLevel: TrainingLevel = 'intermediate'): number {
  const thresholds = getVolumeThresholds(trainingLevel);
  
  if (weeklySets <= 0) return 0;
  if (weeklySets >= thresholds.maxv) return 100;
  
  // Score ramps up from MV to MaxV
  // Below MEV: reduced gains (0-50 score)
  // MEV to MRV: good gains (50-80 score)
  // MRV to MaxV: optimal gains (80-100 score)
  
  if (weeklySets < thresholds.mev) {
    // 0 sets = 0, MV sets = 25, MEV sets = 50
    const mvScore = 25;
    const progress = (weeklySets - thresholds.mv) / (thresholds.mev - thresholds.mv);
    return Math.max(0, Math.min(50, mvScore + progress * 25));
  }
  
  if (weeklySets < thresholds.mrv) {
    // MEV to MRV = 50 to 80
    const progress = (weeklySets - thresholds.mev) / (thresholds.mrv - thresholds.mev);
    return 50 + progress * 30;
  }
  
  // MRV to MaxV = 80 to 100
  const progress = (weeklySets - thresholds.mrv) / (thresholds.maxv - thresholds.mrv);
  return 80 + progress * 20;
}

/**
 * Calculate Progressive Overload Score (0-100)
 * Based on % change in avg 1RM over time window
 */
function calculateProgressiveOverloadScore(oneRMTrendPercent: number): number {
  // -10% or worse = 0, 0% = 50 (maintenance), +10% or better = 100
  const clamped = Math.max(-10, Math.min(10, oneRMTrendPercent));
  return 50 + (clamped / 10) * 50;
}

/**
 * Calculate Frequency Score (0-100)
 * Based on days per week vs optimal (2-3x)
 */
export function calculateFrequencyScore(daysPerWeek: number): number {
  if (daysPerWeek <= 0) return 0;
  // 1x/week = 40, 2x/week = 80, 2.5x/week = 100, 3x/week = 90, 4x+/week = 80 (recovery concern)
  if (daysPerWeek <= 1) return daysPerWeek * 40;
  if (daysPerWeek <= OPTIMAL_FREQUENCY) {
    return 40 + ((daysPerWeek - 1) / (OPTIMAL_FREQUENCY - 1)) * 60;
  }
  // Beyond optimal, slight penalty for recovery
  if (daysPerWeek <= 3) {
    return 100 - ((daysPerWeek - OPTIMAL_FREQUENCY) / (3 - OPTIMAL_FREQUENCY)) * 10;
  }
  return Math.max(60, 90 - (daysPerWeek - 3) * 5);
}

// ============================================================================
// Main API
// ============================================================================

interface SetWithOneRM extends WorkoutSet {
  oneRM: number;
}

/**
 * Calculate hypertrophy score for a specific muscle group
 * @param effectiveNow - Reference date for window calculations. Defaults to the
 *   latest date found in the passed sets (so stale CSV data scores correctly).
 * @param trendWindowDays - Days to look back for progressive overload trend.
 *   Defaults to 28 (4 weeks). Larger values suit longer filter windows.
 */
export function calculateMuscleHypertrophyScore(
  muscleId: string,
  muscleName: string,
  sets: WorkoutSet[],
  assetsMap: Map<string, ExerciseAsset>,
  trainingLevel: TrainingLevel = 'intermediate',
  effectiveNow?: Date,
  trendWindowDays: number = 28
): HypertrophyScoreResult {
  // Filter to working sets only
  const workingSets = sets.filter(s => !isWarmupSet(s));
  
  if (workingSets.length === 0) {
    return {
      totalScore: 0,
      volumeScore: 0,
      progressiveOverload: 0,
      frequency: 0,
      raw: { weeklySets: 0, avgOneRM: 0, oneRMTrend: 0, daysPerWeek: 0 },
    };
  }

  // Calculate 1RM for each set
  const setsWithOneRM: SetWithOneRM[] = workingSets.map(set => ({
    ...set,
    oneRM: calculateEpley1RM(set.weight_kg || 0, set.reps || 0),
  }));

  // Determine effective now: use provided date or latest date in sets
  let maxDate = effectiveNow ?? new Date(0);
  if (!effectiveNow) {
    for (const s of workingSets) {
      if (s.parsedDate && s.parsedDate > maxDate) maxDate = s.parsedDate;
    }
    if (maxDate.getTime() === 0) maxDate = new Date();
  }

  // --- Volume Score ---
  // Calculate rolling weekly average over last 4 weeks
  const now = maxDate;
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const recentSets = setsWithOneRM.filter(s => s.parsedDate && s.parsedDate >= fourWeeksAgo);
  
  // Count unique training days for this muscle
  const trainingDays = new Set(recentSets.map(s => 
    s.parsedDate ? s.parsedDate.toDateString() : ''
  )).size;
  const daysPerWeek = trainingDays / 4;
  
  // Weekly sets (extrapolated from 4-week data)
  const weeklySets = recentSets.length / 4;
  const volumeScore = weeklyStimulusFromThresholds(weeklySets, getVolumeThresholds(trainingLevel));

  // --- Strength Base (removed as factor) ---
  const avgOneRM = setsWithOneRM.reduce((sum, s) => sum + s.oneRM, 0) / setsWithOneRM.length;

  // --- Progressive Overload ---
  // Per-exercise strength trend, weighted by set distribution for this muscle.
  // Each exercise is split at its own midpoint (halfway between earliest and latest
  // data date), ensuring both halves have data as long as the exercise spans ≥2 days.
  // Exercises with <2 sets in either half are skipped.

  // Group sets by exercise name
  const byExercise = new Map<string, typeof setsWithOneRM>();
  for (const s of setsWithOneRM) {
    const name = (s.exercise_title || '').toLowerCase().trim();
    if (!name) continue;
    const bucket = byExercise.get(name);
    if (bucket) bucket.push(s);
    else byExercise.set(name, [s]);
  }

  let totalExerciseSets = 0;
  let weightedTrend = 0;

  for (const [, exSets] of byExercise) {
    if (exSets.length < 4) continue;

    // Find this exercise's own date range
    const dates = exSets
      .map(s => s.parsedDate)
      .filter((d): d is Date => d != null)
      .map(d => d.getTime());
    if (dates.length < 4) continue;

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    if (maxDate - minDate < 2 * 24 * 60 * 60 * 1000) continue; // need ≥2 days

    const exMidpoint = new Date((minDate + maxDate) / 2);
    const older = exSets.filter(s => s.parsedDate && s.parsedDate < exMidpoint);
    const recent = exSets.filter(s => s.parsedDate && s.parsedDate >= exMidpoint);

    if (older.length < 2 || recent.length < 2) continue;

    const olderAvg = older.reduce((sum, s) => sum + s.oneRM, 0) / older.length;
    const recentAvg = recent.reduce((sum, s) => sum + s.oneRM, 0) / recent.length;
    if (olderAvg <= 0) continue;

    const trend = ((recentAvg - olderAvg) / olderAvg) * 100;
    totalExerciseSets += exSets.length;
    weightedTrend += trend * exSets.length;
  }

  const oneRMTrend = totalExerciseSets > 0 ? weightedTrend / totalExerciseSets : 0;
  const progressiveOverload = calculateProgressiveOverloadScore(oneRMTrend);

  // --- Frequency ---
  const frequency = calculateFrequencyScore(daysPerWeek);

  // --- Total Score ---
  // Weights: Volume 50%, Progress 40%, Frequency 10%
  const totalScore = 
    volumeScore * FACTOR_WEIGHTS.volumeScore +
    progressiveOverload * FACTOR_WEIGHTS.progressiveOverload +
    frequency * FACTOR_WEIGHTS.frequency;

  return {
    totalScore: Math.round(totalScore),
    volumeScore: Math.round(volumeScore),
    progressiveOverload: Math.round(progressiveOverload),
    frequency: Math.round(frequency),
    raw: {
      weeklySets: Math.round(weeklySets * 10) / 10,
      avgOneRM: Math.round(avgOneRM * 10) / 10,
      oneRMTrend: Math.round(oneRMTrend * 10) / 10,
      daysPerWeek: Math.round(daysPerWeek * 10) / 10,
    },
  };
}

/**
 * Calculate hypertrophy scores for all muscles in dataset
 * @param useHeadlessMuscleIds - If true, uses the same muscle ID system as the
 *   lifetime achievement view (chest, biceps, triceps, etc.) instead of normalized
 *   muscle groups (Chest, Back, Arms, etc.)
 * @param effectiveNow - Reference date for window calculations. Defaults to the
 *   latest date found in the data (so stale CSV data scores correctly).
 * @param trendWindowDays - Days to look back for progressive overload trend.
 *   Default 28 (4wk). Use 14 for 7d filter, 56 for 30d, 730 for 365d.
 */
export function calculateAllMuscleHypertrophyScores(
  data: WorkoutSet[],
  assetsMap: Map<string, ExerciseAsset>,
  trainingLevel: TrainingLevel = 'intermediate',
  useHeadlessMuscleIds = false,
  effectiveNow?: Date,
  trendWindowDays: number = 28
): MuscleHypertrophyData[] {
  const lowerMap = getLowerMap(assetsMap);
  
  // Compute effective now from data if not provided
  let computedNow = effectiveNow ?? new Date(0);
  if (!effectiveNow) {
    for (const s of data) {
      if (s.parsedDate && s.parsedDate > computedNow) computedNow = s.parsedDate;
    }
    if (computedNow.getTime() === 0) computedNow = new Date();
  }

  // Group sets by muscle
  const muscleSets = new Map<string, { name: string; sets: WorkoutSet[] }>();
  
  if (useHeadlessMuscleIds) {
    // Use the same CSV→SVG→MuscleId chain as the lifetime achievement view
    for (const set of data) {
      if (isWarmupSet(set)) continue;
      if (!set.parsedDate) continue;
      
      const name = set.exercise_title || '';
      const asset = lookupAsset(name, assetsMap, lowerMap);
      if (!asset) continue;
      
      const primaries = String(asset.primary_muscle ?? '').split(',').map(s => s.trim()).filter(Boolean);
      
      // Handle empty primary + non-empty secondary (treat first secondary as primary)
      let primaryMuscles = primaries;
      if (primaryMuscles.length === 0) {
        const secondaries = String(asset.secondary_muscle ?? '').split(',').map(s => s.trim()).filter(Boolean);
        if (secondaries.length > 0) {
          primaryMuscles = [secondaries[0]];
        }
      }
      
      const addedMuscles = new Set<string>();
      
      for (const raw of primaryMuscles) {
        if (/^(cardio|none|other|full[\s-]*body)$/i.test(raw)) continue;
        const muscleIds = getMuscleIdsFromRawName(raw);
        for (const mId of muscleIds) {
          if (addedMuscles.has(mId)) continue;
          addedMuscles.add(mId);
          const displayName = MUSCLE_NAMES[mId] ?? mId.charAt(0).toUpperCase() + mId.slice(1);
          const existing = muscleSets.get(mId);
          if (existing) {
            existing.sets.push(set);
          } else {
            muscleSets.set(mId, { name: displayName, sets: [set] });
          }
        }
      }
    }
  } else {
    // Original behavior: normalize to major groups (Chest, Back, Arms, etc.)
    for (const set of data) {
      if (isWarmupSet(set)) continue;
      if (!set.parsedDate) continue;
      
      const name = set.exercise_title || '';
      const asset = lookupAsset(name, assetsMap, lowerMap);
      if (!asset) continue;
      
      const contributions = getMuscleContributionsFromAsset(asset, true);
      for (const contrib of contributions) {
        const existing = muscleSets.get(contrib.muscle);
        if (existing) {
          existing.sets.push(set);
        } else {
          muscleSets.set(contrib.muscle, { name: contrib.muscle, sets: [set] });
        }
      }
    }
  }
  
  // Calculate score for each muscle
  const results: MuscleHypertrophyData[] = [];
  for (const [muscleId, { name, sets }] of muscleSets) {
    const score = calculateMuscleHypertrophyScore(
      muscleId,
      name,
      sets,
      assetsMap,
      trainingLevel,
      computedNow,
      trendWindowDays
    );
    results.push({ muscleId, muscleName: name, score });
  }
  
  // Sort by total score descending
  return results.sort((a, b) => b.score.totalScore - a.score.totalScore);
}

/**
 * Get score rating label
 */
export function getScoreRating(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Optimal', color: '#22c55e' };
  if (score >= 60) return { label: 'Good', color: '#84cc16' };
  if (score >= 40) return { label: 'Moderate', color: '#f59e0b' };
  if (score >= 20) return { label: 'Low', color: '#f97316' };
  return { label: 'Minimal', color: '#ef4444' };
}

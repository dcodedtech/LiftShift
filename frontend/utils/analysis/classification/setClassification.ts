import type { WorkoutSet } from '../../../types';
import { SET_TYPE_CONFIG, type SetTypeConfig, type SetTypeId } from '../setCommentary/setTypeConfig';

export type { SetTypeConfig, SetTypeId } from '../setCommentary/setTypeConfig';

/**
 * Get the normalized set type ID from a raw set_type value.
 */
export const getSetTypeId = (set: Pick<WorkoutSet, 'set_type'>): SetTypeId => {
  const t = String(set.set_type ?? '').trim().toLowerCase();
  if (!t || t === 'normal' || t === 'working' || t === 'work' || t === 'regular' || t === 'standard') return 'normal';
  if (t === 'warmup' || t === 'w' || t.includes('warm')) return 'warmup';
  if (t === 'left' || t === 'l') return 'left';
  if (t === 'right' || t === 'r') return 'right';
  if (t === 'dropset' || t === 'drop' || t === 'd') return 'dropset';
  if (t === 'failure' || t === 'fail' || t === 'x') return 'failure';
  if (t === 'amrap' || t === 'a') return 'amrap';
  if (t === 'restpause' || t === 'rp' || (t.includes('rest') && t.includes('pause'))) return 'restpause';
  if (t === 'myoreps' || t === 'myo' || t === 'm') return 'myoreps';
  if (t === 'cluster' || t === 'c') return 'cluster';
  if (t === 'giantset' || t === 'giant' || t === 'g') return 'giantset';
  if (t === 'superset' || t === 'super' || t === 's') return 'superset';
  if (t === 'backoff' || t === 'back' || t === 'b' || (t.includes('back') && t.includes('off'))) return 'backoff';
  if (t === 'topset' || t === 'top' || t === 't') return 'topset';
  if (t === 'feederset' || t === 'feeder' || t === 'f') return 'feederset';
  if (t === 'negative' || t === 'negatives' || t === 'eccentric' || t === 'n') return 'negative';
  if (t === 'partial' || t === 'p' || t.includes('partial')) return 'partial';
  return 'normal';
};

/**
 * Get the configuration for a set's type.
 */
export const getSetTypeConfig = (set: Pick<WorkoutSet, 'set_type'>): SetTypeConfig => {
  return SET_TYPE_CONFIG[getSetTypeId(set)];
};

/**
 * Check if a set is a warmup set.
 */
export const isWarmupSet = (set: Pick<WorkoutSet, 'set_type'>): boolean => {
  return getSetTypeId(set) === 'warmup';
};

/**
 * Check if a set is a working set (not warmup).
 */
export const isWorkingSet = (set: Pick<WorkoutSet, 'set_type'>): boolean => {
  return getSetTypeConfig(set).isWorkingSet;
};

/**
 * Check if a set is a unilateral (left or right) set.
 */
export const isUnilateralSet = (set: Pick<WorkoutSet, 'set_type'>): boolean => {
  const id = getSetTypeId(set);
  return id === 'left' || id === 'right';
};

/**
 * Check if a set is specifically a left-side set.
 */
export const isLeftSet = (set: Pick<WorkoutSet, 'set_type'>): boolean => {
  return getSetTypeId(set) === 'left';
};

/**
 * Check if a set is specifically a right-side set.
 */
export const isRightSet = (set: Pick<WorkoutSet, 'set_type'>): boolean => {
  return getSetTypeId(set) === 'right';
};

/**
 * Get the display label for a set (short label or set number).
 * Returns the short label (like 'W', 'L', 'R', 'P', etc.) for special sets,
 * or the working set number for normal sets.
 */
export const getSetDisplayLabel = (
  set: Pick<WorkoutSet, 'set_type'>,
  workingSetNumber: number
): string => {
  const config = getSetTypeConfig(set);
  // For normal sets, show the working set number
  if (config.id === 'normal') {
    return String(workingSetNumber);
  }
  // For special sets, show the short label
  return config.shortLabel || String(workingSetNumber);
};

/**
 * Count effective working sets using per-type hypertrophy factors.
 *
 * Each set contributes its hypertrophyFactor (from SET_TYPE_CONFIG):
 *   normal/topset/failure/amrap/cluster/giantset/superset/negative/partial = 1.0
 *   left/right/dropset/backoff = 0.5 | myoreps/restpause = 0.5
 *   warmup/feederset = 0.0
 *
 * Warmup sets are excluded by default (they carry factor 0.0 regardless).
 * Unilateral sets can be promoted to full (1.0) via countUnilateralAsFull.
 */
export const countSets = (
  sets: WorkoutSet[],
  options: { excludeWarmup?: boolean; countUnilateralAsFull?: boolean } = {}
): number => {
  const { excludeWarmup = true, countUnilateralAsFull = false } = options;

  if (sets.length === 0) return 0;

  let count = 0;

  for (const set of sets) {
    if (excludeWarmup && isWarmupSet(set)) {
      continue;
    }

    const typeId = getSetTypeId(set);
    if (countUnilateralAsFull && (typeId === 'left' || typeId === 'right')) {
      count += 1;
    } else {
      count += getSetTypeConfig(set).hypertrophyFactor;
    }
  }

  return count;
};

/**
 * Get effective set count for display/analysis purposes.
 * Simply counts all working sets (warmups excluded).
 */
export const getEffectiveSetCount = (sets: WorkoutSet[]): number => {
  return countSets(sets, { excludeWarmup: true });
};

/**
 * Per-set hypertrophy contribution factor for weekly volume analytics.
 * Reads the hypertrophyFactor from each set type's config.
 */
export const getWeeklyVolumeSetWeight = (set: Pick<WorkoutSet, 'set_type'>): number => {
  return getSetTypeConfig(set).hypertrophyFactor;
};

import Papa from 'papaparse';
import type { ParseResult } from './csvParserTypes';
import type { LegacyParseOptions } from './csvParser';
import type { WorkoutSet } from '../../types';
import { toKg } from './csvRowTransform';
import { extractUnitFromHeader, normalize } from './csvParserUtils';

const MILES_TO_KM = 1.609344;
const METERS_TO_KM = 0.001;

const toKm = (distance: number, headerUnit: string | undefined): number => {
  if (!Number.isFinite(distance) || distance < 0) return 0;
  const unit = normalize(headerUnit ?? '') || 'm';
  if (unit.startsWith('km')) return distance;
  if (unit.startsWith('mi')) return distance * MILES_TO_KM;
  return distance * METERS_TO_KM;
};

const parseWorkoutDate = (dateStr: string): Date | null => {
  const cleaned = dateStr.trim();
  if (!cleaned) return null;
  const date = new Date(cleaned.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const parseMotraCSV = async (
  csvContent: string,
  options: LegacyParseOptions
): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(csvContent.trim(), {
      header: false,
      skipEmptyLines: false,
      complete: (results) => {
        try {
          const rows = results.data;
          const sets: WorkoutSet[] = [];

          let currentTitle = '';
          let currentStartTime = '';
          let currentEndTime = '';

          let inSetsBlock = false;
          let setIndex = 0;
          let exerciseIndex = -1;
          let currentExercise = '';

          let detectedWeightUnit: string | undefined;
          let detectedDistUnit: string | undefined;

          let currentWorkoutSets: WorkoutSet[] = [];

          const finalizeWorkout = () => {
            for (const s of currentWorkoutSets) {
              s.end_time = currentEndTime;
              sets.push(s);
            }
            currentWorkoutSets = [];
          };

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const cell0 = row[0]?.trim();
            if (!cell0) {
              inSetsBlock = false;
              continue;
            }

            if (cell0 === 'Workout Start') {
              finalizeWorkout();
              currentStartTime = row[1]?.trim() || '';
              currentEndTime = '';
              if (i > 0 && rows[i - 1] && rows[i - 1][0]) {
                currentTitle = rows[i - 1][0].trim();
              }
              inSetsBlock = false;
              setIndex = 0;
              exerciseIndex = -1;
              currentExercise = '';
              continue;
            }

            if (cell0 === 'Workout End') {
              currentEndTime = row[1]?.trim() || '';
              continue;
            }

            if (cell0 === 'All Sets') {
              inSetsBlock = true;
              const headerRow = rows[i + 1];
              if (headerRow && headerRow.length > 1 && !detectedWeightUnit) {
                const weightHeader = headerRow[1]?.trim() || '';
                const distHeader = headerRow[4]?.trim() || '';
                detectedWeightUnit = extractUnitFromHeader(weightHeader) || undefined;
                detectedDistUnit = extractUnitFromHeader(distHeader) || undefined;
              }
              i++;
              continue;
            }

            if (inSetsBlock) {
              const exerciseName = cell0;
              const weightStr = row[1]?.trim() || '0';
              const repsStr = row[2]?.trim() || '0';
              const timeStr = row[3]?.trim() || '0';
              const distStr = row[4]?.trim() || '0';
              const restStr = row[5]?.trim() || '0';
              const noteStr = row[7]?.trim() || '';

              if (exerciseName === 'Exercise') continue;

              if (exerciseName !== currentExercise) {
                currentExercise = exerciseName;
                exerciseIndex++;
                setIndex = 0;
              }

              const rawWeight = parseFloat(weightStr) || 0;
              const reps = parseInt(repsStr, 10) || 0;
              const duration_seconds = parseInt(timeStr, 10) || 0;
              const restTime = parseInt(restStr, 10) || 0;
              const rawDistance = parseFloat(distStr) || 0;

              const parsedDate = parseWorkoutDate(currentStartTime);
              if (!parsedDate) continue;

              const weight_kg = toKg(rawWeight, undefined, detectedWeightUnit, options.unit);
              const displayUnit = normalize(detectedWeightUnit ?? '') || options.unit;
              const isLbs = displayUnit.startsWith('lb');

              const distance_km = rawDistance > 0 ? toKm(rawDistance, detectedDistUnit) : 0;

              const rpe: number | null = null;

              currentWorkoutSets.push({
                title: currentTitle,
                start_time: currentStartTime,
                end_time: currentEndTime,
                description: '',
                exercise_title: exerciseName,
                exercise_index: exerciseIndex,
                superset_id: '',
                exercise_notes: noteStr,
                set_index: setIndex,
                set_type: 'normal',
                weight_kg,
                weight_unit: isLbs ? 'lbs' : 'kg',
                reps,
                distance_km,
                duration_seconds,
                rpe,
                parsedDate,
                source: 'motra',
              });

              setIndex++;
            }
          }
          finalizeWorkout();

          if (sets.length === 0) {
            reject(new Error('No sets found in Motra CSV. Please check the file format.'));
            return;
          }

          resolve({
            sets,
            meta: {
              confidence: 1,
              fieldMappings: { 'Motra': detectedWeightUnit === 'lbs' ? 'Block Format (lbs)' : 'Block Format (kg)' },
              rowCount: sets.length,
            }
          });
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      },
      error: (error: Error) => reject(error)
    });
  });
};

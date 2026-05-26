import Papa from 'papaparse';
import type { ParseResult } from './csvParserTypes';
import type { LegacyParseOptions } from './csvParser';
import type { WorkoutSet } from '../../types';

export const parseMotraCSV = async (
  csvContent: string,
  _options: LegacyParseOptions
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
              // The title is usually the row before this one
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
              i++; // Skip the header row: "Exercise, Weight (kgs), ..."
              continue;
            }

            if (inSetsBlock) {
              // Row format: Exercise, Weight (kgs), Reps, Time (seconds), Distance (m), Rest Time (seconds), Primary Muscle Groups, Note
              const exerciseName = cell0;
              const weightStr = row[1]?.trim() || '0';
              const repsStr = row[2]?.trim() || '0';
              const timeStr = row[3]?.trim() || '0';
              const distStr = row[4]?.trim() || '0';
              const noteStr = row[7]?.trim() || '';

              // Skip headers if somehow we didn't skip them
              if (exerciseName === 'Exercise') continue;

              if (exerciseName !== currentExercise) {
                currentExercise = exerciseName;
                exerciseIndex++;
                setIndex = 0; // Reset set index for new exercise in this workout
              }
              
              const weight_kg = parseFloat(weightStr) || 0;
              const reps = parseInt(repsStr, 10) || 0;
              const duration_seconds = parseInt(timeStr, 10) || 0;
              const distance_km = (parseFloat(distStr) || 0) / 1000;
              
              const parsedDate = new Date(currentStartTime.replace(' ', 'T'));
              
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
                weight_unit: 'kg', // Motra exports in kgs
                reps,
                distance_km,
                duration_seconds,
                rpe: null,
                parsedDate,
                source: 'motra'
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
              fieldMappings: { 'Motra': 'Block Format' },
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

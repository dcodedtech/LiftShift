import { useState, useEffect, useLayoutEffect } from 'react';
import { useTheme } from '../../components/theme/ThemeProvider';
import { useFont } from '../../components/theme/FontProvider';
import { setContext } from '../../utils/integrations/analytics';
import {
  FontChoice,
  WeightUnit,
  getWeightUnit,
  saveWeightUnit,
  StoredBodyMapGender,
  getBodyMapGender,
  saveBodyMapGender,
  ExerciseTrendMode,
  getExerciseTrendMode,
  saveExerciseTrendMode,
  getSecondarySetMultiplier,
  saveSecondarySetMultiplier,
} from '../../utils/storage/localStorage';
import { BodyMapGender } from '../../components/bodyMap/BodyMap';

export interface UseAppPreferencesReturn {
  // Theme
  mode: string;
  setMode: (mode: string) => void;

  // Font
  font: FontChoice;
  setFont: (font: FontChoice) => void;
  
  // Weight unit
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  
  // Body map gender
  bodyMapGender: BodyMapGender;
  setBodyMapGender: (gender: BodyMapGender) => void;
  
  // Exercise trend mode
  exerciseTrendMode: ExerciseTrendMode;
  setExerciseTrendMode: (mode: ExerciseTrendMode) => void;

  // Secondary set multiplier
  secondarySetMultiplier: number;
  setSecondarySetMultiplier: (value: number) => void;
}

export function useAppPreferences(): UseAppPreferencesReturn {
  const { mode, setMode } = useTheme();
  const { font, setFont } = useFont();
  
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(() => getWeightUnit());
  const [bodyMapGender, setBodyMapGenderState] = useState<BodyMapGender>(() => getBodyMapGender());
  const [exerciseTrendMode, setExerciseTrendModeState] = useState<ExerciseTrendMode>(() => getExerciseTrendMode());
  const [secondarySetMultiplier, setSecondarySetMultiplierState] = useState<number>(() => getSecondarySetMultiplier());

  // Persist weight unit
  useEffect(() => {
    saveWeightUnit(weightUnit);
    setContext({ weight_unit: weightUnit });
  }, [weightUnit]);

  // Persist body map gender
  useEffect(() => {
    saveBodyMapGender(bodyMapGender as StoredBodyMapGender);
    setContext({ body_map_gender: bodyMapGender });
  }, [bodyMapGender]);

  // Persist exercise trend mode
  useEffect(() => {
    saveExerciseTrendMode(exerciseTrendMode);
  }, [exerciseTrendMode]);

  // Persist secondary set multiplier
  useEffect(() => {
    saveSecondarySetMultiplier(secondarySetMultiplier);
  }, [secondarySetMultiplier]);

  // Apply CSS variables - heatmap hue (warm red for dark themes)
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--heatmap-hue', '142');
    root.style.setProperty('--bodymap-hover-rgb', '14 90 182');
    root.style.setProperty('--bodymap-selection-rgb', '37 99 235');
  }, []);

  return {
    mode,
    setMode,
    font,
    setFont,
    weightUnit,
    setWeightUnit: setWeightUnitState,
    bodyMapGender,
    setBodyMapGender: setBodyMapGenderState,
    exerciseTrendMode,
    setExerciseTrendMode: setExerciseTrendModeState,
    secondarySetMultiplier,
    setSecondarySetMultiplier: setSecondarySetMultiplierState,
  };
}

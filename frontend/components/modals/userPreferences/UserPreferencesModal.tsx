import React from 'react';
import { Settings, X } from 'lucide-react';
import { FontChoice, WeightUnit, ThemeMode, ExerciseTrendMode } from '../../../utils/storage/localStorage';
import { BodyMapGender } from '../../bodyMap/BodyMap';
import { resolveDarkBgByMode, resolveLightBg } from '../../../src/assets/images/misc/bgConfig';
import {
  BodyMapGenderSection,
  FontSection,
  ThemeSection,
  TrendModeSection,
  WeightUnitSection,
  SecondarySetMultiplierSection,
  TransparencySection,
} from './UserPreferencesSections';

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightUnit: WeightUnit;
  onWeightUnitChange: (unit: WeightUnit) => void;
  bodyMapGender: BodyMapGender;
  onBodyMapGenderChange: (gender: BodyMapGender) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  exerciseTrendMode: ExerciseTrendMode;
  onExerciseTrendModeChange: (mode: ExerciseTrendMode) => void;
  secondarySetMultiplier: number;
  onSecondarySetMultiplierChange: (value: number) => void;
  font: FontChoice;
  onFontChange: (font: FontChoice) => void;
  showTransparency: boolean;
  onShowTransparencyChange: (value: boolean) => void;
  darkBgChoice: string;
  onDarkBgChoiceChange: (value: string) => void;
  lightBgChoice: string;
  onLightBgChoiceChange: (value: string) => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({
  isOpen,
  onClose,
  weightUnit,
  onWeightUnitChange,
  bodyMapGender,
  onBodyMapGenderChange,
  themeMode,
  onThemeModeChange,
  exerciseTrendMode,
  onExerciseTrendModeChange,
  secondarySetMultiplier,
  onSecondarySetMultiplierChange,
  font,
  onFontChange,
  showTransparency,
  onShowTransparencyChange,
  darkBgChoice,
  onDarkBgChoiceChange,
  lightBgChoice,
  onLightBgChoiceChange,
}) => {
  if (!isOpen) return null;

  const isLightTheme = themeMode === 'light';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <div className="min-h-full w-full px-3 sm:px-4 py-3 sm:py-6 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative bg-slate-950 border border-slate-700/50 rounded-xl p-4 sm:p-5 overflow-hidden backdrop-blur-md shadow-lg">
            {!isLightTheme ? (
              <img
                src={resolveDarkBgByMode(themeMode, darkBgChoice)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
              />
            ) : (
              <img
                src={resolveLightBg(lightBgChoice)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
              />
            )}

            <div className="relative flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-200">Preferences</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-900/20 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:ring-1 hover:ring-emerald-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative space-y-3 md:space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
                <WeightUnitSection weightUnit={weightUnit} onWeightUnitChange={onWeightUnitChange} />
                <BodyMapGenderSection bodyMapGender={bodyMapGender} onBodyMapGenderChange={onBodyMapGenderChange} />
              </div>
              <div className="grid grid-cols-2 gap-3 md:hidden">
                <TrendModeSection
                  exerciseTrendMode={exerciseTrendMode}
                  onExerciseTrendModeChange={onExerciseTrendModeChange}
                />
                <FontSection font={font} onFontChange={onFontChange} />
              </div>
              <div className="hidden md:block">
                <TrendModeSection
                  exerciseTrendMode={exerciseTrendMode}
                  onExerciseTrendModeChange={onExerciseTrendModeChange}
                />
              </div>
              <div className="md:hidden">
                <TransparencySection showTransparency={showTransparency} onShowTransparencyChange={onShowTransparencyChange} />
              </div>
              <div className="hidden md:grid md:grid-cols-2 md:gap-4">
                <FontSection font={font} onFontChange={onFontChange} />
                <TransparencySection showTransparency={showTransparency} onShowTransparencyChange={onShowTransparencyChange} />
              </div>
              <ThemeSection
                themeMode={themeMode}
                onThemeModeChange={onThemeModeChange}
                showTransparency={showTransparency}
                darkBgChoice={darkBgChoice}
                onDarkBgChoiceChange={onDarkBgChoiceChange}
                lightBgChoice={lightBgChoice}
                onLightBgChoiceChange={onLightBgChoiceChange}
              />
              <SecondarySetMultiplierSection
                secondarySetMultiplier={secondarySetMultiplier}
                onSecondarySetMultiplierChange={onSecondarySetMultiplierChange}
              />
            </div>

            <div className="relative mt-4 pt-3 border-t border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

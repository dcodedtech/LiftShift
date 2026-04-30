import React from 'react';
import { Brain } from 'lucide-react';
import type { DailySummary, ExerciseStats, WorkoutSet } from '../../../types';
import type { ThemeMode } from '../../../utils/storage/localStorage';
import { Tooltip, useTooltip } from '../../ui/Tooltip';
import { AiAnalyzeCategoryChips } from '../../modals/aiAnalyze/AiAnalyzeCategoryChips';
import { AiAnalyzeFooter } from '../../modals/aiAnalyze/AiAnalyzeFooter';
import { AiAnalyzeModuleGrid } from '../../modals/aiAnalyze/AiAnalyzeModuleGrid';
import { AiAnalyzeTimeframePicker } from '../../modals/aiAnalyze/AiAnalyzeTimeframePicker';
import { useAiAnalyzeState } from '../../modals/aiAnalyze/useAiAnalyzeState';

interface DashboardAIAnalysisCardProps {
  fullData: WorkoutSet[];
  dailyData: DailySummary[];
  exerciseStats: ExerciseStats[];
  effectiveNow: Date;
  themeMode: ThemeMode;
}

export const DashboardAIAnalysisCard: React.FC<DashboardAIAnalysisCardProps> = ({
  fullData,
  dailyData,
  exerciseStats,
  effectiveNow,
  themeMode,
}) => {
  const isLightTheme = themeMode === 'light';
  const { tooltip, showTooltip, hideTooltip } = useTooltip();

  const {
    months,
    setMonths,
    activeCategory,
    setActiveCategory,
    selectedIds,
    toggleModule,
    visibleModules,
    isReady,
    isGenerating,
    reCopyCopied,
    handleGenerate,
    handleReCopy,
    handleOpenGemini,
  } = useAiAnalyzeState({
    isOpen: true,
    fullData,
    dailyData,
    exerciseStats,
    effectiveNow,
  });

  return (
    <div className="bg-black/70 border border-slate-700/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-300">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
          <p className="text-[11px] text-slate-500">Generate analysis prompts directly from your dashboard</p>
        </div>
      </div>

      <AiAnalyzeTimeframePicker months={months} setMonths={setMonths} />

      <div className="space-y-2">
        <AiAnalyzeCategoryChips
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isLightTheme={isLightTheme}
        />

        <AiAnalyzeModuleGrid
          visibleModules={visibleModules}
          selectedIds={selectedIds}
          onToggleModule={toggleModule}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          isLightTheme={isLightTheme}
        />
      </div>

      <AiAnalyzeFooter
        isReady={isReady}
        isGenerating={isGenerating}
        reCopyCopied={reCopyCopied}
        rawOnly={selectedIds.length === 0}
        onGenerate={handleGenerate}
        onOpenGemini={handleOpenGemini}
        onReCopy={handleReCopy}
      />

      {tooltip && <Tooltip data={tooltip} />}
    </div>
  );
};

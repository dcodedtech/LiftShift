import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DailySummary, ExerciseStats, WorkoutSet } from '../../../types';
import { exportPackageAndCopyText, exportSetsAndCopyTextOnly, getSetsForExportScope } from '../../../utils/export/clipboardExport';
import {
  ANALYSIS_MODULES,
  buildPromptTemplate,
  type AnalysisCategory,
  type AnalysisModuleId,
  type TimeframeMonths,
} from './aiAnalyzeConfig';

interface UseAiAnalyzeStateArgs {
  isOpen: boolean;
  fullData: WorkoutSet[];
  dailyData: DailySummary[];
  exerciseStats: ExerciseStats[];
  effectiveNow: Date;
}

export const useAiAnalyzeState = ({
  isOpen,
  fullData,
  dailyData,
  exerciseStats,
  effectiveNow,
}: UseAiAnalyzeStateArgs) => {
  const [months, setMonths] = useState<TimeframeMonths>(1);
  const [activeCategory, setActiveCategory] = useState<AnalysisCategory>('all');
  const [selectedIds, setSelectedIds] = useState<AnalysisModuleId[]>(['general_deep_audit']);

  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reCopyCopied, setReCopyCopied] = useState(false);

  const lastGeneratedRef = useRef<{ months: TimeframeMonths; promptTemplate: string | null; rawOnly: boolean } | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsReady(false);
    setIsGenerating(false);
    setReCopyCopied(false);
    lastGeneratedRef.current = null;
  }, [isOpen]);

  const visibleModules = useMemo(() => {
    if (activeCategory === 'all') return ANALYSIS_MODULES;
    return ANALYSIS_MODULES.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const selectedModules = useMemo(() => {
    const set = new Set(selectedIds);
    return ANALYSIS_MODULES.filter((m) => set.has(m.id));
  }, [selectedIds]);

  const handleReset = useCallback(() => {
    setIsReady(false);
    setIsGenerating(false);
    setReCopyCopied(false);
    lastGeneratedRef.current = null;

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      resetTimeoutRef.current = setTimeout(() => {
        handleReset();
      }, 4000);
    } else if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [isReady, handleReset]);

  const prevMonthsRef = useRef(months);
  const prevActiveCategoryRef = useRef(activeCategory);

  useEffect(() => {
    const monthsChanged = prevMonthsRef.current !== months;
    const categoryChanged = prevActiveCategoryRef.current !== activeCategory;

    if ((monthsChanged || categoryChanged) && isReady) {
      handleReset();
    }

    prevMonthsRef.current = months;
    prevActiveCategoryRef.current = activeCategory;
  }, [months, activeCategory, isReady, handleReset]);

  const toggleModule = useCallback(
    (id: AnalysisModuleId) => {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      if (isReady) handleReset();
    },
    [isReady, handleReset]
  );

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      const rawOnly = selectedModules.length === 0;
      if (rawOnly) {
        const scopedSets = getSetsForExportScope(fullData, months, effectiveNow);
        await exportSetsAndCopyTextOnly(scopedSets);
        lastGeneratedRef.current = { months, promptTemplate: null, rawOnly: true };
      } else {
        const promptTemplate = buildPromptTemplate({ months, selectedModules });
        await exportPackageAndCopyText(
          fullData,
          dailyData,
          exerciseStats,
          months,
          new Date(),
          effectiveNow,
          promptTemplate
        );
        lastGeneratedRef.current = { months, promptTemplate, rawOnly: false };
      }
      setIsReady(true);
    } catch (e) {
      console.error('AI analysis export failed', e);
    } finally {
      setIsGenerating(false);
    }

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, [dailyData, effectiveNow, exerciseStats, fullData, isGenerating, months, selectedModules]);

  const handleReCopy = useCallback(async () => {
    if (!lastGeneratedRef.current || isGenerating) return;

    const { months: lastMonths, promptTemplate, rawOnly } = lastGeneratedRef.current;

    try {
      if (rawOnly || !promptTemplate) {
        const scopedSets = getSetsForExportScope(fullData, lastMonths, effectiveNow);
        await exportSetsAndCopyTextOnly(scopedSets);
      } else {
        await exportPackageAndCopyText(
          fullData,
          dailyData,
          exerciseStats,
          lastMonths,
          new Date(),
          effectiveNow,
          promptTemplate
        );
      }
      setReCopyCopied(true);
      window.setTimeout(() => setReCopyCopied(false), 2000);
    } catch (e) {
      console.error('Re-copy failed', e);
    }

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, [dailyData, effectiveNow, exerciseStats, fullData, isGenerating]);

  const handleOpenGemini = useCallback(() => {
    const instruction = 'Paste the clipboard contents.';
    const url = `https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-pro-preview&prompt=${encodeURIComponent(instruction)}`;
    window.open(url, '_blank');

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  return {
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
  };
};

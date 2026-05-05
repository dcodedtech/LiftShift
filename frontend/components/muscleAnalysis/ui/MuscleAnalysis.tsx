import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutSet } from '../../../types';
import { ViewHeader } from '../../layout/ViewHeader';
import { Activity, Dumbbell } from 'lucide-react';
import { BodyMapGender } from '../../bodyMap/BodyMap';
import { useMuscleSelection } from '../hooks/useMuscleSelection';
import { useMuscleVolumeData } from '../hooks/useMuscleVolumeData';
import type { WeeklySetsWindow } from '../../../utils/muscle/analytics';
import { useMuscleHeatmapData } from '../hooks/useMuscleHeatmapData';
import { useMuscleTrendData } from '../hooks/useMuscleTrendData';
import { useMuscleAnalysisHandlers } from '../hooks/useMuscleAnalysisHandlers';
import { useLifetimeAchievement } from '../hooks/useLifetimeAchievement';
import { MuscleAnalysisBodyMapPanel } from './MuscleAnalysisBodyMapPanel';
import { MuscleAnalysisGraphPanel } from './MuscleAnalysisGraphPanel';
import { MuscleAnalysisExerciseListPanel } from './MuscleAnalysisExerciseListPanel';
import { LifetimeAchievementCard } from './LifetimeAchievementCard';
import { TooltipData } from '../../ui/Tooltip';
import { prefetchHistoryData } from '../../../utils/prefetch/prefetchStrategies';
import { calculateAllMuscleHypertrophyScores, FACTOR_WEIGHTS } from '../../../utils/muscle/hypertrophy/hypertrophyScore';
import { weeklyStimulusFromThresholds } from '../../../utils/muscle/hypertrophy/hypertrophyCalculations';
import { getVolumeThresholds } from '../../../utils/muscle/hypertrophy/muscleParams';

interface MuscleAnalysisProps {
  data: WorkoutSet[];
  lifetimeData: WorkoutSet[];
  filterCacheKey: string;
  filtersSlot?: React.ReactNode;
  onExerciseClick?: (exerciseName: string) => void;
  initialMuscle?: { muscleId: string; viewMode?: 'headless' } | null;
  initialWeeklySetsWindow?: WeeklySetsWindow | null;
  onInitialMuscleConsumed?: () => void;
  stickyHeader?: boolean;
  bodyMapGender?: BodyMapGender;
  now?: Date;
  secondarySetMultiplier?: number;
}

export const MuscleAnalysis: React.FC<MuscleAnalysisProps> = ({
  data,
  lifetimeData,
  filterCacheKey,
  filtersSlot,
  onExerciseClick,
  initialMuscle,
  initialWeeklySetsWindow,
  onInitialMuscleConsumed,
  stickyHeader = false,
  bodyMapGender = 'male',
  now,
  secondarySetMultiplier = 0.5,
}) => {
  const [weeklySetsChartView, setWeeklySetsChartView] = useState<'heatmap' | 'radar'>('heatmap');
  const [hoverTooltip, setHoverTooltip] = useState<TooltipData | null>(null);

  const {
    selectedMuscle,
    setSelectedMuscle,
    weeklySetsWindow,
    setWeeklySetsWindow,
    selectedSvgIdForUrlRef,
    clearSelectionUrl,
    updateSelectionUrl,
    clearSelection,
  } = useMuscleSelection({
    initialMuscle,
    initialWeeklySetsWindow,
    onInitialMuscleConsumed,
    isLoading: false,
  });

  const {
    exerciseMuscleData,
    muscleVolume,
    isLoading,
    assetsMap,
    windowStart,
    breakdownStart,
    effectiveNow,
    allTimeWindowStart,
    lifetimeHeadlessVolumes,
  } = useMuscleVolumeData({
    data,
    lifetimeData,
    weeklySetsWindow,
    now,
    secondarySetMultiplier,
  });

  // Prefetch History view data after 3 seconds on Muscle Analysis
  useEffect(() => {
    if (data.length === 0 || !effectiveNow) return;
    
    const timer = setTimeout(() => {
      prefetchHistoryData(filterCacheKey, data, effectiveNow);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [filterCacheKey, data, effectiveNow]);

  const {
    muscleVolumes,
    maxVolume,
    windowedGroupVolumes,
    groupedBodyMapVolumes,
    maxGroupVolume,
    selectedSubjectKeys,
    groupWeeklyRatesBySubject,
    headlessRatesMap,
    radarData,
  } = useMuscleHeatmapData({
    data,
    assetsMap,
    windowStart,
    effectiveNow,
    weeklySetsWindow,
    selectedMuscle,
    filterCacheKey,
    secondarySetMultiplier,
  });

  const {
    weeklySetsSummary,
    legendMaxSets,
    trainingLevel,
    volumeThresholds,
    weeklySetsDelta,
    trendData,
    legendTrendData,
    windowedSelectionBreakdown,
    contributingExercises,
    totalSets,
    musclesWorked,
  } = useMuscleTrendData({
    data,
    assetsMap,
    windowStart,
    breakdownStart,
    effectiveNow,
    allTimeWindowStart,
    weeklySetsWindow,
    selectedSubjectKeys,
    groupWeeklyRatesBySubject,
    headlessRatesMap,
    muscleVolume,
    windowedGroupVolumes,
    muscleVolumes,
    filterCacheKey,
    secondarySetMultiplier,
  });

  // Compute hypertrophy scores for all muscles (used by card, body map tooltip, graph)
  const hypertrophyScores = useMemo(() => {
    if (!lifetimeData || !assetsMap || lifetimeData.length === 0) return [];
    const windowedData = windowStart
      ? lifetimeData.filter(s => s.parsedDate && s.parsedDate >= windowStart)
      : lifetimeData;
    if (windowedData.length === 0) return [];

    const refNow = effectiveNow ?? new Date();
    const dataSpanDays = windowStart
      ? Math.max(1, (refNow.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000))
      : 365;
    const trendWindowDays = Math.round(Math.max(14, Math.min(730, dataSpanDays * 2)));

    const scores = calculateAllMuscleHypertrophyScores(windowedData, assetsMap, trainingLevel, true, effectiveNow, trendWindowDays);

    if (headlessRatesMap && headlessRatesMap.size > 0) {
      for (const m of scores) {
        const rate = headlessRatesMap.get(m.muscleId);
        if (rate !== undefined) {
          m.score.volumeScore = Math.round(weeklyStimulusFromThresholds(rate, getVolumeThresholds(trainingLevel)));
          m.score.raw.weeklySets = Math.round(rate * 10) / 10;
          m.score.totalScore = Math.round(
            m.score.volumeScore * FACTOR_WEIGHTS.volumeScore +
            m.score.progressiveOverload * FACTOR_WEIGHTS.progressiveOverload +
            m.score.frequency * FACTOR_WEIGHTS.frequency
          );
        }
      }
      scores.sort((a, b) => b.score.totalScore - a.score.totalScore);
    }
    return scores;
  }, [lifetimeData, assetsMap, effectiveNow, windowStart, headlessRatesMap, trainingLevel]);

  // Fast lookup map: muscleId → total hypertrophy score
  const hypertrophyScoreMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of hypertrophyScores) m.set(s.muscleId, s.score.totalScore);
    return m;
  }, [hypertrophyScores]);

  const {
    handleMuscleClick,
    handleMuscleHover,
    selectedBodyMapIds,
    hoveredBodyMapIds,
  } = useMuscleAnalysisHandlers({
    selectedMuscle,
    setSelectedMuscle,
    selectedSvgIdForUrlRef,
    clearSelectionUrl,
    updateSelectionUrl,
    weeklySetsWindow,
    headlessRatesMap,
    setHoverTooltip,
    trainingLevel,
    hypertrophyScoreMap,
  });

  const lifetimeAchievementData = useLifetimeAchievement({
    lifetimeHeadlessVolumes,
    weeklyHeadlessVolumes: headlessRatesMap,
    selectedMuscle,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading muscle data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-slate-400 mb-2">No workout data for current filter</div>
        <div className="text-slate-500 text-sm">Try adjusting your date filter to see muscle analysis</div>
      </div>
    );
  }

  return (
    <div className="space-y-1 flex flex-col">
      <div className="hidden sm:contents">
        <ViewHeader
          leftStats={[{ icon: Activity, value: totalSets, label: 'Total Sets' }]}
          rightStats={[{ icon: Dumbbell, value: musclesWorked, label: 'Muscles' }]}
          filtersSlot={filtersSlot}
          sticky={stickyHeader}
        />
      </div>

      {/* Main layout: 3 columns on desktop, stacked on mobile */}
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-2 lg:h-[80vh] lg:min-h-0">
        {/* Column 1: Body Map (1/3 width, full height) */}
        <div className="h-[400px] sm:h-[450px] lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full min-h-0">
          <MuscleAnalysisBodyMapPanel
            bodyMapGender={bodyMapGender}
            weeklySetsChartView={weeklySetsChartView}
            setWeeklySetsChartView={setWeeklySetsChartView}
            weeklySetsWindow={weeklySetsWindow}
            setWeeklySetsWindow={setWeeklySetsWindow}
            selectedSvgIdForUrlRef={selectedSvgIdForUrlRef}
            updateSelectionUrl={updateSelectionUrl}
            muscleVolumes={muscleVolumes}
            maxVolume={maxVolume}
            volumeThresholds={volumeThresholds}
            selectedMuscle={selectedMuscle}
            selectedBodyMapIds={selectedBodyMapIds}
            hoveredBodyMapIds={hoveredBodyMapIds}
            handleMuscleClick={handleMuscleClick}
            handleMuscleHover={handleMuscleHover}
            radarData={radarData}
            hoverTooltip={hoverTooltip}
          />
        </div>

        {/* Column 2: Weekly Sets Graph */}
        <div className="h-[300px] sm:h-[350px] lg:col-start-2 lg:row-start-1 lg:h-full min-h-0">
          <MuscleAnalysisGraphPanel
            selectedMuscle={selectedMuscle}
            weeklySetsWindow={weeklySetsWindow}
            weeklySetsSummary={weeklySetsSummary}
            legendMaxSets={legendMaxSets}
            volumeThresholds={volumeThresholds}
            volumeDelta={weeklySetsDelta}
            trendData={trendData}
            legendTrendData={legendTrendData}
            windowedSelectionBreakdown={windowedSelectionBreakdown}
            clearSelection={clearSelection}
            hypertrophyScore={selectedMuscle ? hypertrophyScoreMap.get(selectedMuscle) : undefined}
          />
        </div>

        {/* Column 3: Exercise List */}
        <div className="h-[300px] sm:h-auto lg:h-full lg:max-h-none lg:col-start-3 lg:row-start-1 min-h-0">
          <MuscleAnalysisExerciseListPanel
            contributingExercises={contributingExercises}
            assetsMap={assetsMap}
            exerciseMuscleData={exerciseMuscleData}
            totalSetsInWindow={windowedSelectionBreakdown?.totalSetsInWindow ?? 0}
            volumeThresholds={volumeThresholds}
            onExerciseClick={onExerciseClick}
            bodyMapGender={bodyMapGender}
            secondarySetMultiplier={secondarySetMultiplier}
            selectedMuscle={selectedMuscle}
          />
        </div>

        {/* Bottom row: Lifetime Growth Unlocked (columns 2-3) */}
        {lifetimeAchievementData && (
          <div className="h-[300px] lg:h-full lg:col-start-2 lg:col-span-2 lg:row-start-2 min-h-0">
            <LifetimeAchievementCard
              data={lifetimeAchievementData}
              selectedMuscleId={selectedMuscle}
              onMuscleClick={handleMuscleClick}
              workoutData={data}
              assetsMap={assetsMap}
              effectiveNow={effectiveNow}
              windowStart={windowStart}
              headlessRatesMap={headlessRatesMap}
              trainingLevel={trainingLevel}
              hypertrophyScores={hypertrophyScores}
            />
          </div>
        )}
      </div>
    </div>
  );
};

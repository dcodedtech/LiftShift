import React from 'react';
import type { BodyMapGender } from '../../bodyMap/BodyMap';
import type { DailySummary, ExerciseStats, WorkoutSet } from '../../../types';
import type { WeightUnit } from '../../../utils/storage/localStorage';
import type { TimelineProgress } from '../../../utils/training/trainingTimeline';
import type { DashboardSummaryResult } from '../../../utils/analysis/dashboardSummary/dashboardSummary';
import { DashboardHeaderBar } from './DashboardHeaderBar';
import { DashboardInsightsSection } from './DashboardInsightsSection';
import { DashboardPrimaryCharts } from './DashboardPrimaryCharts';
import { DashboardSecondaryCharts } from './DashboardSecondaryCharts';

interface DashboardLayoutProps {
  isMounted: boolean;
  filtersSlot?: React.ReactNode;
  stickyHeader: boolean;
  totalWorkouts: number;
  totalSets: number;
  totalPrs: number;
  dashboardInsights: any;
  dashboardSummary: DashboardSummaryResult;
  onDayClick?: (date: Date) => void;
  onMuscleClick?: (muscleId: string, weeklySetsWindow: 'all' | '7d' | '30d' | '365d') => void;
  onExerciseClick?: (exerciseName: string) => void;
  activePlateauExercises: any[];
  assetsMap?: Map<string, any> | null;
  assetsLowerMap?: Map<string, any> | null;
  weightUnit: WeightUnit;
  dailyData: DailySummary[];
  effectiveNow: Date;
  trainingLevel: import('../../../utils/muscle/hypertrophy/muscleParams').TrainingLevel;
  timelineProgress: TimelineProgress;
  chartModes: { volumeVsDuration: 'daily' | 'weekly' | 'monthly' | 'yearly'; intensityEvo: 'daily' | 'weekly' | 'monthly' | 'yearly'; prTrend: 'daily' | 'weekly' | 'monthly' | 'yearly' };
  toggleChartMode: (key: 'volumeVsDuration' | 'intensityEvo' | 'prTrend', mode: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  prTrendView: 'area' | 'bar';
  setPrTrendView: (v: 'area' | 'bar') => void;
  prsData: any[];
  prTrendDelta: any;
  prTrendDelta7d: any;
  weeklySetsView: 'heatmap' | 'radar';
  setWeeklySetsView: (v: 'heatmap' | 'radar') => void;
  compositionGrouping: 'muscles' | 'groups';
  muscleCompQuick: 'all' | '7d' | '30d' | '365d';
  setMuscleCompQuick: (v: 'all' | '7d' | '30d' | '365d') => void;
  weeklySetsDashboard: any;
  bodyMapGender: BodyMapGender;
  intensityView: 'area' | 'stackedBar';
  setIntensityView: (v: 'area' | 'stackedBar') => void;
  intensityData: any[];
  intensityInsight: any;
  muscleGrouping: 'groups' | 'muscles';
  setMuscleGrouping: (v: 'groups' | 'muscles') => void;
  musclePeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
  setMusclePeriod: (v: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all') => void;
  muscleTrendView: 'area' | 'stackedBar';
  setMuscleTrendView: (v: 'area' | 'stackedBar') => void;
  trendData: any[];
  trendKeys: string[];
  muscleTrendInsight: any;
  muscleVsLabel: string;
  weekShapeView: 'radar' | 'bar';
  setWeekShapeView: (v: 'radar' | 'bar') => void;
  weekShapeData: any[];
  weeklyRhythmInsight: any;
  volumeView: 'area' | 'bar';
  setVolumeView: (v: 'area' | 'bar') => void;
  volumeDurationData: any[];
  volumeDensityTrend: any;
  topExerciseMode: 'volume' | 'pr';
  setTopExerciseMode: (v: 'volume' | 'pr') => void;
  topExercisesView: 'barh' | 'area';
  setTopExercisesView: (v: 'barh' | 'area') => void;
  topExercisesBarData: any[];
  topExercisesOverTimeData: any[];
  topExerciseNames: string[];
  topExercisesInsight: any;
  pieColors: string[];
  tooltipStyle: any;
  fullData: WorkoutSet[];
  exerciseStats: ExerciseStats[];
  themeMode: string;
  animationKeyframes: string;
  hypertrophyData: any[];
  hypertrophyData30d?: any[];
  hypertrophyPeriod: '7d' | '30d';
  setHypertrophyPeriod: (v: '7d' | '30d') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  const {
    isMounted,
    filtersSlot,
    stickyHeader,
    totalWorkouts,
    totalSets,
    totalPrs,
    dashboardInsights,
    dashboardSummary,
    onDayClick,
    onMuscleClick,
    onExerciseClick,
    activePlateauExercises,
    assetsMap,
    assetsLowerMap,
    weightUnit,
    dailyData,
    effectiveNow,
    trainingLevel,
    timelineProgress,
    chartModes,
    toggleChartMode,
    prTrendView,
    setPrTrendView,
    prsData,
    prTrendDelta,
    prTrendDelta7d,
    weeklySetsView,
    setWeeklySetsView,
    compositionGrouping,
    muscleCompQuick,
    setMuscleCompQuick,
    weeklySetsDashboard,
    bodyMapGender,
    intensityView,
    setIntensityView,
    intensityData,
    intensityInsight,
    muscleGrouping,
    setMuscleGrouping,
    musclePeriod,
    setMusclePeriod,
    muscleTrendView,
    setMuscleTrendView,
    trendData,
    trendKeys,
    muscleTrendInsight,
    muscleVsLabel,
    weekShapeView,
    setWeekShapeView,
    weekShapeData,
    weeklyRhythmInsight,
    volumeView,
    setVolumeView,
    volumeDurationData,
    volumeDensityTrend,
    topExerciseMode,
    setTopExerciseMode,
    topExercisesView,
    setTopExercisesView,
    topExercisesBarData,
    topExercisesOverTimeData,
    topExerciseNames,
    topExercisesInsight,
    pieColors,
    tooltipStyle,
    fullData,
    exerciseStats,
    themeMode,
    animationKeyframes,
    hypertrophyData,
    hypertrophyData30d,
    hypertrophyPeriod,
    setHypertrophyPeriod,
  } = props;

  return (
    <>
      <style>{animationKeyframes}</style>
      <div className={`space-y-2 pb-2 transition-opacity duration-700 ease-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <DashboardHeaderBar
          totalWorkouts={totalWorkouts}
          filtersSlot={filtersSlot}
          stickyHeader={stickyHeader}
        />

        <DashboardInsightsSection
          dashboardInsights={dashboardInsights}
          totalWorkouts={totalWorkouts}
          totalSets={totalSets}
          totalPrs={totalPrs}
          weightUnit={weightUnit}
          dashboardSummary={dashboardSummary}
          effectiveNow={effectiveNow}
          onExerciseClick={onExerciseClick}
          onDayClick={onDayClick}
          activePlateauExercises={activePlateauExercises}
          assetsMap={assetsMap}
          assetsLowerMap={assetsLowerMap}
          dailyData={dailyData}
          timelineProgress={timelineProgress}
        />

        <DashboardPrimaryCharts
          isMounted={isMounted}
          chartModes={chartModes}
          toggleChartMode={toggleChartMode}
          prTrendView={prTrendView}
          setPrTrendView={setPrTrendView}
          prsData={prsData}
          prTrendDelta={prTrendDelta}
          prTrendDelta7d={prTrendDelta7d}
          weeklySetsView={weeklySetsView}
          setWeeklySetsView={setWeeklySetsView}
          compositionGrouping={compositionGrouping}
          muscleCompQuick={muscleCompQuick}
          setMuscleCompQuick={setMuscleCompQuick}
          weeklySetsDashboard={weeklySetsDashboard}
          onMuscleClick={onMuscleClick}
          bodyMapGender={bodyMapGender}
          effectiveNow={effectiveNow}
          trainingLevel={trainingLevel}
          intensityView={intensityView}
          setIntensityView={setIntensityView}
          intensityData={intensityData}
          intensityInsight={intensityInsight}
          muscleGrouping={muscleGrouping}
          setMuscleGrouping={setMuscleGrouping}
          musclePeriod={musclePeriod}
          setMusclePeriod={setMusclePeriod}
          muscleTrendView={muscleTrendView}
          setMuscleTrendView={setMuscleTrendView}
          trendData={trendData}
          trendKeys={trendKeys}
          muscleTrendInsight={muscleTrendInsight}
          muscleVsLabel={muscleVsLabel}
          tooltipStyle={tooltipStyle}
          volumeView={volumeView}
          setVolumeView={setVolumeView}
          weightUnit={weightUnit}
          volumeDurationData={volumeDurationData}
          volumeDensityTrend={volumeDensityTrend}
          fullData={fullData}
          dailyData={dailyData}
          exerciseStats={exerciseStats}
          effectiveNow={effectiveNow}
          themeMode={themeMode}
          hypertrophyData={hypertrophyData}
          hypertrophyData30d={hypertrophyData30d}
          hypertrophyPeriod={hypertrophyPeriod}
          setHypertrophyPeriod={setHypertrophyPeriod}
        />
      </div>

      <div className="space-y-2">
        <DashboardSecondaryCharts
          topExerciseMode={topExerciseMode}
          setTopExerciseMode={setTopExerciseMode}
          topExercisesView={topExercisesView}
          setTopExercisesView={setTopExercisesView}
          topExercisesBarData={topExercisesBarData}
          topExercisesOverTimeData={topExercisesOverTimeData}
          topExerciseNames={topExerciseNames}
          topExercisesInsight={topExercisesInsight}
          pieColors={pieColors}
          tooltipStyle={tooltipStyle}
          onExerciseClick={onExerciseClick}
          assetsMap={assetsMap}
          assetsLowerMap={assetsLowerMap}
        />
      </div>
    </>
  );
};

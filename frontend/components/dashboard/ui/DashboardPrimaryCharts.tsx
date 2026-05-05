import React, { Suspense, useMemo } from 'react';
import { ChartSkeleton } from '../../ui/ChartSkeleton';
import { LazyRender } from '../../ui/LazyRender';
import type { BodyMapGender } from '../../bodyMap/BodyMap';
import type { DailySummary, ExerciseStats, WorkoutSet } from '../../../types';
import type { WeightUnit } from '../../../utils/storage/localStorage';
import { DashboardAIAnalysisCard } from './DashboardAIAnalysisCard';

const WeeklySetsCard = React.lazy(() => import('../weeklySets/WeeklySetsCard').then((m) => ({ default: m.WeeklySetsCard })));
const MuscleTrendCard = React.lazy(() => import('../muscleTrend/MuscleTrendCard').then((m) => ({ default: m.MuscleTrendCard })));
const PrTrendCard = React.lazy(() => import('../prTrend/PrTrendCard').then((m) => ({ default: m.PrTrendCard })));
const IntensityEvolutionCard = React.lazy(() => import('../intensityEvolution/IntensityEvolutionCard').then((m) => ({ default: m.IntensityEvolutionCard })));
const HypertrophyScatterCard = React.lazy(() => import('../hypertrophy/HypertrophyScatterCard').then((m) => ({ default: m.HypertrophyScatterCard })));
const HypertrophyBarCard = React.lazy(() => import('../hypertrophy/HypertrophyBarCard').then((m) => ({ default: m.HypertrophyBarCard })));
const VolumeDensityCard = React.lazy(() => import('../volumeDensity/VolumeDensityCard').then((m) => ({ default: m.VolumeDensityCard })));

interface DashboardPrimaryChartsProps {
  isMounted: boolean;
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
  onMuscleClick?: (muscleId: string, weeklySetsWindow: 'all' | '7d' | '30d' | '365d') => void;
  bodyMapGender: BodyMapGender;
  effectiveNow: Date;
  trainingLevel: import('../../../utils/muscle/hypertrophy/muscleParams').TrainingLevel;
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
  tooltipStyle: any;
  volumeView: 'area' | 'bar';
  setVolumeView: (v: 'area' | 'bar') => void;
  weightUnit: WeightUnit;
  volumeDurationData: any[];
  volumeDensityTrend: any;
  fullData: WorkoutSet[];
  dailyData: DailySummary[];
  exerciseStats: ExerciseStats[];
  effectiveNow: Date;
  themeMode: string;
  hypertrophyData: any[];
  hypertrophyData30d?: any[];
  hypertrophyPeriod: '7d' | '30d';
  setHypertrophyPeriod: (v: '7d' | '30d') => void;
}

export const DashboardPrimaryCharts: React.FC<DashboardPrimaryChartsProps> = ({
  isMounted,
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
  onMuscleClick,
  bodyMapGender,
  effectiveNow,
  trainingLevel,
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
  tooltipStyle,
  volumeView,
  setVolumeView,
  weightUnit,
  volumeDurationData,
  volumeDensityTrend,
  fullData,
  dailyData,
  exerciseStats,
  themeMode,
  hypertrophyData,
  hypertrophyData30d,
  hypertrophyPeriod,
  setHypertrophyPeriod,
}) => {
  const scatterHypertrophyData = useMemo(() =>
    hypertrophyData.filter(m => m.score.raw.weeklySets >= 1.0 && m.score.raw.daysPerWeek >= 1.0),
    [hypertrophyData]
  );

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <Suspense fallback={<ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />}>
        <PrTrendCard
          isMounted={isMounted}
          mode={chartModes.prTrend}
          onToggle={(m) => toggleChartMode('prTrend', m)}
          view={prTrendView}
          onViewToggle={setPrTrendView}
          prsData={prsData}
          tooltipStyle={tooltipStyle as any}
          prTrendDelta={prTrendDelta}
          prTrendDelta7d={prTrendDelta7d}
        />
      </Suspense>

      <Suspense fallback={<ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />}>
        <WeeklySetsCard
          isMounted={isMounted}
          weeklySetsView={weeklySetsView}
          setWeeklySetsView={setWeeklySetsView}
          muscleCompQuick={muscleCompQuick}
          setMuscleCompQuick={setMuscleCompQuick}
          heatmap={weeklySetsDashboard.heatmap}
          tooltipStyle={tooltipStyle as any}
          onMuscleClick={(muscleId, viewMode) => onMuscleClick?.(muscleId, viewMode, muscleCompQuick)}
          bodyMapGender={bodyMapGender}
          windowStart={weeklySetsDashboard.windowStart}
          now={effectiveNow}
          trainingLevel={trainingLevel}
        />
      </Suspense>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <LazyRender className="lg:h-auto" placeholder={<ChartSkeleton className="h-[350px] sm:h-[450px]" />}>
        <Suspense fallback={<ChartSkeleton className="h-[350px] sm:h-[450px]" />}>
          <HypertrophyScatterCard
            hypertrophyData={scatterHypertrophyData}
            hypertrophyPeriod={hypertrophyPeriod}
            setHypertrophyPeriod={setHypertrophyPeriod}
          />
        </Suspense>
      </LazyRender>

      <LazyRender className=" lg:h-auto" placeholder={<ChartSkeleton className="h-[350px] sm:h-[450px]" />}>
        <Suspense fallback={<ChartSkeleton className="h-[350px] sm:h-[450px]" />}>
          <HypertrophyBarCard
            hypertrophyData={hypertrophyData}
            hypertrophyData30d={hypertrophyData30d}
            selectedMuscleId={null}
            onMuscleClick={(muscleId) => onMuscleClick?.(muscleId, muscleCompQuick)}
            hypertrophyPeriod={hypertrophyPeriod}
            setHypertrophyPeriod={setHypertrophyPeriod}
          />
        </Suspense>
      </LazyRender>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <DashboardAIAnalysisCard
        fullData={fullData}
        dailyData={dailyData}
        exerciseStats={exerciseStats}
        effectiveNow={effectiveNow}
        themeMode={themeMode}
      />

      <LazyRender className="min-w-0" placeholder={<ChartSkeleton className="min-h-[400px] sm:min-h-[520px]" />}>
        <Suspense fallback={<ChartSkeleton className="min-h-[400px] sm:min-h-[520px]" />}>
          <VolumeDensityCard
            isMounted={isMounted}
            mode={chartModes.volumeVsDuration}
            onToggle={(m) => toggleChartMode('volumeVsDuration', m)}
            view={volumeView}
            onViewToggle={setVolumeView}
            weightUnit={weightUnit}
            volumeDurationData={volumeDurationData}
            volumeDensityTrend={volumeDensityTrend as any}
            tooltipStyle={tooltipStyle as any}
          />
        </Suspense>
      </LazyRender>
    </div>

    <LazyRender className="min-w-0" placeholder={<ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />}>
      <Suspense fallback={<ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />}>
        <IntensityEvolutionCard
          isMounted={isMounted}
          mode={chartModes.intensityEvo}
          onToggle={(m) => toggleChartMode('intensityEvo', m)}
          view={intensityView}
          onViewToggle={setIntensityView}
          intensityData={intensityData}
          intensityInsight={intensityInsight}
          tooltipStyle={tooltipStyle as any}
        />
      </Suspense>
    </LazyRender>

    <LazyRender className="min-w-0" placeholder={<ChartSkeleton className="min-h-[400px] sm:min-h-[520px]" />}>
      <Suspense fallback={<ChartSkeleton className="min-h-[400px] sm:min-h-[520px]" />}>
        <MuscleTrendCard
          isMounted={isMounted}
          muscleGrouping={muscleGrouping}
          setMuscleGrouping={setMuscleGrouping}
          musclePeriod={musclePeriod}
          setMusclePeriod={setMusclePeriod}
          muscleTrendView={muscleTrendView}
          setMuscleTrendView={setMuscleTrendView}
          trendData={trendData}
          trendKeys={trendKeys}
          muscleTrendInsight={muscleTrendInsight as any}
          tooltipStyle={tooltipStyle as any}
          muscleVsLabel={muscleVsLabel}
        />
      </Suspense>
    </LazyRender>
  </>
  );
};

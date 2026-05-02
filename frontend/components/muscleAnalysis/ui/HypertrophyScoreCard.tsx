import React, { useMemo, useState } from 'react';
import { TrendingUp, BarChart3, ScatterChart } from 'lucide-react';
import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Tooltip, useTooltip } from '../../ui/Tooltip';
import { SegmentControl } from '../../ui/SegmentControl';
import { useIsMobile } from '../../insights/useIsMobile';
import {
  FACTOR_COLORS,
  FACTOR_WEIGHTS,
  getScoreRating,
  type MuscleHypertrophyData,
} from '../../../utils/muscle/hypertrophy/hypertrophyScore';

// ============================================================================
// FactorProgressBar — stacked pill bar showing Volume / Progress / Frequency
// ============================================================================

const FactorProgressBar: React.FC<{
  volumeScore: number;
  progressiveOverload: number;
  frequency: number;
}> = ({ volumeScore, progressiveOverload, frequency }) => {
  const isMobile = useIsMobile(768);
  const TOTAL_PILLS = isMobile ? 15 : 30;

  const pillData = useMemo(() =>
    Array.from({ length: TOTAL_PILLS }).map(() => {
      const flexGrow = Math.floor(Math.random() * 3) + 1;
      return { flexGrow, marginLeft: flexGrow > 1 ? '1px' : '2px' };
    }),
    [TOTAL_PILLS]
  );

  const totalFlex = pillData.reduce((sum, p) => sum + p.flexGrow, 0);
  const segs = [
    { color: FACTOR_COLORS.volumeScore, filled: (volumeScore / 100) * FACTOR_WEIGHTS.volumeScore * totalFlex },
    { color: FACTOR_COLORS.progressiveOverload, filled: (progressiveOverload / 100) * FACTOR_WEIGHTS.progressiveOverload * totalFlex },
    { color: FACTOR_COLORS.frequency, filled: (frequency / 100) * FACTOR_WEIGHTS.frequency * totalFlex },
  ];

  let segAcc = 0;
  const segBounds = segs
    .filter(s => s.filled > 0)
    .map(s => { const start = segAcc; segAcc += s.filled; return { ...s, start, end: segAcc }; });
  const totalFilled = segAcc;

  let accumulatedFlex = 0;
  return (
    <div className="flex items-center h-2.5">
      {pillData.map((pill, idx) => {
        const pillStart = accumulatedFlex;
        const pillEnd = accumulatedFlex + pill.flexGrow;
        accumulatedFlex += pill.flexGrow;
        const fillStart = Math.max(pillStart, 0);
        const fillEnd = Math.min(pillEnd, totalFilled);
        const fillAmount = Math.max(0, fillEnd - fillStart);
        const fillPercent = pill.flexGrow > 0 ? ((fillAmount / pill.flexGrow) * 100) : 0;
        const seg = segBounds.find(s => fillStart < s.end);
        return (
          <div key={idx} className="h-full rounded-sm relative overflow-hidden"
            style={{ flexGrow: pill.flexGrow, marginLeft: idx === 0 ? 0 : pill.marginLeft, backgroundColor: 'rgba(100, 100, 100, 0.15)' }}>
            {fillPercent > 0 && (
              <div className="absolute top-0 left-0 h-full rounded-sm"
                style={{ width: `${fillPercent}%`, backgroundColor: seg?.color ?? 'rgba(100,100,100,0.3)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// HypertrophyScatterChart — scatter plot (Progress × Volume) per muscle
// ============================================================================

const SCATTER_DOT_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

const HypertrophyScatterChart: React.FC<{ data: MuscleHypertrophyData[] }> = ({ data }) => {
  const chartData = useMemo(() =>
    data.map(m => ({
      name: m.muscleName,
      muscleId: m.muscleId,
      progress: Math.round(m.score.progressiveOverload * FACTOR_WEIGHTS.progressiveOverload),
      volume: Math.round(m.score.volumeScore * FACTOR_WEIGHTS.volumeScore),
      total: m.score.totalScore,
    })),
    [data]
  );

  const getColor = (total: number) => {
    if (total >= 80) return SCATTER_DOT_COLORS[0];
    if (total >= 60) return SCATTER_DOT_COLORS[1];
    if (total >= 40) return SCATTER_DOT_COLORS[2];
    if (total >= 20) return SCATTER_DOT_COLORS[3];
    return SCATTER_DOT_COLORS[4];
  };

  const diagonalData = [{ progress: 0, volume: 0 }, { progress: 50, volume: 50 }];

  const extremes = useMemo(() => {
    if (chartData.length === 0) return [];
    const seen = new Set<string>();
    const result: typeof chartData = [];
    const push = (d: (typeof chartData)[number]) => {
      if (d && !seen.has(d.muscleId)) { seen.add(d.muscleId); result.push(d); }
    };
    const by = (k: 'volume' | 'progress' | 'total') => [...chartData].sort((a, b) => b[k] - a[k]);
    push(by('volume')[0]);
    push(by('volume').slice(-1)[0]);
    push(by('progress')[0]);
    push(by('progress').slice(-1)[0]);
    push(by('total')[0]);
    push(by('total').slice(-1)[0]);
    return result;
  }, [chartData]);

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="rounded-lg px-3 py-2 shadow-2xl border text-xs"
        style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.95)', borderColor: 'rgb(var(--border-rgb) / 0.5)', color: 'var(--text-primary)' }}>
        <p className="font-semibold mb-1.5">{d?.name} <span className="opacity-60 font-normal">({d?.total}/100)</span></p>
        <div className="flex items-center gap-3">
          <span style={{ color: '#3b82f6' }}>Progress <b>{d?.progress}/40</b></span>
          <span style={{ color: '#22c55e' }}>Volume <b>{d?.volume}/50</b></span>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReScatterChart margin={{ top: 28, right: 8, bottom: 28, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
        <XAxis type="number" dataKey="progress" domain={[0, 50]}
          tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#475569' }}
          label={{ value: 'Progress', position: 'bottom', offset: 5, fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
        <YAxis type="number" dataKey="volume" domain={[0, 50]}
          tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#475569' }} width={28}
          label={{ value: 'Volume', angle: 0, position: 'insideTop', offset: -18, dx: +12, fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
        <RechartsTooltip content={<CustomScatterTooltip />} />
        <Scatter data={diagonalData} line={{ stroke: '#94a3b8', strokeDasharray: '4 4', strokeWidth: 1 }} lineType="joint" shape={() => <></>} isAnimationActive={false} legendType="none" />
        <Scatter data={chartData} shape="circle" isAnimationActive={false}>
          {chartData.map((entry) => (
            <Cell key={entry.muscleId} fill={getColor(entry.total)} fillOpacity={0.85} stroke={getColor(entry.total)} strokeWidth={0.5} />
          ))}
        </Scatter>
        <Scatter data={extremes} shape="circle" isAnimationActive={false} legendType="none"
          label={{ dataKey: 'name', position: 'top', fontSize: 9, fill: '#94a3b8', offset: 6 }}>
          {extremes.map((entry) => (
            <Cell key={entry.muscleId} fill="transparent" stroke="none" />
          ))}
        </Scatter>
      </ReScatterChart>
    </ResponsiveContainer>
  );
};

// ============================================================================
// HypertrophyScoreCard — main component
// ============================================================================

export interface HypertrophyScoreCardProps {
  hypertrophyData: MuscleHypertrophyData[];
  selectedMuscleId?: string | null;
  onMuscleClick?: (muscleId: string) => void;
}

export const HypertrophyScoreCard: React.FC<HypertrophyScoreCardProps> = ({
  hypertrophyData,
  selectedMuscleId,
  onMuscleClick,
}) => {
  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const [chartMode, setChartMode] = useState<'bar' | 'scatter'>('scatter');

  const stats = useMemo(() => {
    if (hypertrophyData.length === 0) return null;
    const avgScore = hypertrophyData.reduce((sum, m) => sum + m.score.totalScore, 0) / hypertrophyData.length;
    return { avgScore, bestMuscle: hypertrophyData[0], count: hypertrophyData.length };
  }, [hypertrophyData]);

  const handleHypertrophyMouseEnter = (e: React.MouseEvent, m: MuscleHypertrophyData) => {
    const raw = m.score.raw;
    const volW = Math.round(m.score.volumeScore * FACTOR_WEIGHTS.volumeScore);
    const progW = Math.round(m.score.progressiveOverload * FACTOR_WEIGHTS.progressiveOverload);
    const freqW = Math.round(m.score.frequency * FACTOR_WEIGHTS.frequency);
    const trendSign = raw.oneRMTrend > 0 ? '+' : '';
    const trendLabel = `${trendSign}${raw.oneRMTrend.toFixed(1)}%`;
    const volMax = Math.round(FACTOR_WEIGHTS.volumeScore * 100);
    const progMax = Math.round(FACTOR_WEIGHTS.progressiveOverload * 100);
    const freqMax = Math.round(FACTOR_WEIGHTS.frequency * 100);
    showTooltip(e, {
      title: m.muscleName,
      body: `Volume: ${volW}/${volMax} → ${raw.weeklySets.toFixed(1)} sets/week\n` +
        `Progress: ${progW}/${progMax} → ${trendLabel} trend\n` +
        `Frequency: ${freqW}/${freqMax} → ${raw.daysPerWeek.toFixed(1)} days/week`,
      status: m.score.totalScore >= 60 ? 'success' : m.score.totalScore >= 40 ? 'info' : 'warning',
    });
  };

  const chartModeOptions = [
    { value: 'bar', icon: <BarChart3 className="w-3 h-3 rotate-90" />, title: 'Bar view' },
    { value: 'scatter', icon: <ScatterChart className="w-3 h-3" />, title: 'Scatter plot' },
  ] as const;

  return (
    <div className="bg-black/70 rounded-xl border border-slate-700/50 overflow-hidden h-full min-h-0 flex flex-col">
      {/* Header */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white">Hypertrophy Score</h2>
            <SegmentControl
              options={chartModeOptions}
              value={chartMode}
              onChange={(v) => setChartMode(v as 'bar' | 'scatter')}
            />
          </div>
        </div>

        {/* Stats ring — hidden in scatter mode to maximise chart area */}
        {chartMode !== 'scatter' && stats && (
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <svg width="56" height="56" className="transform -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="5" stroke="rgba(100, 100, 100, 0.1)" />
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="5"
                  stroke={getScoreRating(stats.avgScore).color} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - stats.avgScore / 100)}
                  className="transition-all duration-700 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-bold text-white">{Math.round(stats.avgScore)}%</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mt-0.5">
                {(() => {
                  const rating = getScoreRating(stats.avgScore);
                  return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: `${rating.color}20`, color: rating.color }}>
                      <TrendingUp className="w-3 h-3" />
                      {rating.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{stats.count} muscles tracked</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {Math.round(stats.avgScore)}% average · Best: {stats.bestMuscle?.muscleName} ({stats.bestMuscle?.score.totalScore}%)
              </p>
            </div>
          </div>
        )}

        {chartMode === 'scatter' && !stats && (
          <div className="text-[10px] text-slate-500 py-2">No workout data available for hypertrophy scoring.</div>
        )}
      </div>

      {/* Per-muscle breakdown */}
      <div className={`px-3 pb-3 flex-1 min-h-0 ${chartMode === 'scatter' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        {hypertrophyData.length > 0 ? (
          chartMode === 'scatter' ? (
            <div className="flex-1 min-h-[180px]" style={{ position: 'relative' }}>
              <HypertrophyScatterChart data={hypertrophyData} />
            </div>
          ) : (
            <div className="space-y-2 pr-3">
              {/* Color legend */}
              <div className="flex items-center gap-3 px-1">
                {([
                  { color: FACTOR_COLORS.volumeScore, label: 'Volume', desc: 'Volume: weekly sets mapped to possible gains % using a diminishing-returns model. 50% weight — doing enough weekly sets for growth.' },
                  { color: FACTOR_COLORS.progressiveOverload, label: 'Progress', desc: 'Progress: per-exercise strength trend weighted by set distribution. 40% weight — ±10% trend maps 0–100 score (0% = maintaining, +10% = max).' },
                  { color: FACTOR_COLORS.frequency, label: 'Frequency', desc: 'Frequency: training days per week for this muscle. 10% weight — optimal at 2–3 sessions per week.' },
                ] as const).map((item) => (
                  <div key={item.label} className="flex items-center gap-1 cursor-help"
                    onMouseEnter={(e) => showTooltip(e, { title: item.label, body: item.desc, status: 'info' })}
                    onMouseLeave={hideTooltip}>
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[8px] text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
              {hypertrophyData.map((m) => {
                const isSelected = m.muscleId === selectedMuscleId;
                const rating = getScoreRating(m.score.totalScore);
                return (
                  <div key={m.muscleId}
                    className="flex items-center gap-2 rounded px-1 py-0.5 -mx-1 group relative cursor-pointer"
                    onClick={() => { if (window.innerWidth >= 1024) onMuscleClick?.(m.muscleId); }}
                    onMouseEnter={(e) => handleHypertrophyMouseEnter(e, m)}
                    onMouseLeave={hideTooltip}>
                    <span className={`text-[10px] w-[15%] lg:w-[12%] truncate flex-shrink-0 ${isSelected ? 'font-semibold text-white' : 'text-slate-500'}`}>
                      {m.muscleName}
                    </span>
                    <div className="w-[43%] lg:w-[55%]">
                      <FactorProgressBar volumeScore={m.score.volumeScore} progressiveOverload={m.score.progressiveOverload} frequency={m.score.frequency} />
                    </div>
                    <span className={`text-[10px] font-semibold w-[10%] text-right flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                      {m.score.totalScore}%
                    </span>
                    <span className="text-[9px] flex items-center gap-1 w-[20%] lg:w-[12%] flex-shrink-0" style={{ color: rating.color }}>
                      <span className="truncate">{rating.label}</span>
                      <TrendingUp className="w-3 h-3" />
                    </span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-[10px] text-slate-500 py-4 text-center">No muscle data available.</div>
        )}
      </div>
      {tooltip && <Tooltip data={tooltip} />}
    </div>
  );
};

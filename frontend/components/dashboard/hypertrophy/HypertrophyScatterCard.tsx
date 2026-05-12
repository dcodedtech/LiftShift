import React, { useMemo } from 'react';
import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from 'recharts';
import { SegmentControl } from '../../ui/SegmentControl';
import { SEMI_FANCY_FONT } from '../../../utils/ui/uiConstants';
import {
  FACTOR_WEIGHTS,
  type MuscleHypertrophyData,
} from '../../../utils/muscle/hypertrophy/hypertrophyScore';

const PROGRESS_MID = 25;
const VOLUME_MID = 25;

const SCORE_COLORS = ['#ef4444', '#f59e0b', '#22c55e'] as const;

const getDotColor = (total: number) => {
  if (total <= 30) return SCORE_COLORS[0];
  if (total <= 60) return SCORE_COLORS[1];
  return SCORE_COLORS[2];
};

const volColor = (v: number) => v <= 15 ? '#ef4444' : v <= 35 ? '#f59e0b' : '#22c55e';
const progColor = (v: number) => v <= 11 ? '#ef4444' : v <= 22 ? '#f59e0b' : '#22c55e';

interface ChartPoint {
  name: string;
  muscleId: string;
  progress: number;
  volume: number;
  total: number;
  quadrant: string;
}

interface HypertrophyScatterCardProps {
  hypertrophyData: MuscleHypertrophyData[];
  hypertrophyPeriod: '7d' | '30d';
  setHypertrophyPeriod: (v: '7d' | '30d') => void;
}

function getQuadrant(progress: number, volume: number): string {
  if (volume >= VOLUME_MID && progress < PROGRESS_MID) return 'Volume Focus';
  if (volume >= VOLUME_MID && progress >= PROGRESS_MID) return 'Optimal Growth';
  if (volume < VOLUME_MID && progress < PROGRESS_MID) return 'Undertrained';
  return 'Strength Focus';
}

/** Euclidean distance in (progress, volume) space — max domain is (50,50) so max dist ~70 */
function dist(a: ChartPoint, b: ChartPoint): number {
  return Math.sqrt((a.progress - b.progress) ** 2 + (a.volume - b.volume) ** 2);
}

const QUADRANT_CENTERS = [
  { progress: PROGRESS_MID / 2, volume: VOLUME_MID / 2 },
  { progress: PROGRESS_MID / 2, volume: VOLUME_MID + (50 - VOLUME_MID) / 2 },
  { progress: PROGRESS_MID + (50 - PROGRESS_MID) / 2, volume: VOLUME_MID / 2 },
  { progress: PROGRESS_MID + (50 - PROGRESS_MID) / 2, volume: VOLUME_MID + (50 - VOLUME_MID) / 2 },
];

function filterLabelsByCluster(points: ChartPoint[]): string[] {
  if (points.length === 0) return [];
  const sorted = [...points].sort((a, b) => b.total - a.total);
  const ids = new Set<string>();
  for (let i = 0; i < sorted.length; i++) {
    let tooClose = false;
    // Skip points near quadrant centers — they'll get leader-line labels instead
    for (const qc of QUADRANT_CENTERS) {
      const d = Math.sqrt((sorted[i].progress - qc.progress) ** 2 + (sorted[i].volume - qc.volume) ** 2);
      if (d < 8) { tooClose = true; break; }
    }
    if (tooClose) continue;
    for (const labeled of sorted) {
      if (!ids.has(labeled.muscleId)) continue;
      const d = dist(sorted[i], labeled);
      if (d < 3) { tooClose = true; break; }
    }
    if (!tooClose) {
      ids.add(sorted[i].muscleId);
    }
  }
  return Array.from(ids);
}

export const HypertrophyScatterCard: React.FC<HypertrophyScatterCardProps> = ({
  hypertrophyData,
  hypertrophyPeriod,
  setHypertrophyPeriod,
}) => {
  const chartData: ChartPoint[] = useMemo(() =>
    hypertrophyData.map(m => {
      const progress = Math.round(m.score.progressiveOverload);
      const volume = Math.round(m.score.volumeScore * FACTOR_WEIGHTS.volumeScore);
      return {
        name: m.muscleName,
        muscleId: m.muscleId,
        progress,
        volume,
        total: m.score.totalScore,
        quadrant: getQuadrant(progress, volume),
      };
    }),
    [hypertrophyData]
  );

  const labeledIds = useMemo(() => filterLabelsByCluster(chartData), [chartData]);

  const QUADRANT_PUSH = 8;

  const unlabeledDirs = useMemo(() => {
    const dirs = new Map<string, { dx: number; dy: number }>();
    const labeledSet = new Set(labeledIds);
    for (const point of chartData) {
      if (labeledSet.has(point.muscleId)) continue;
      let bestDx = 1, bestDy = 0;
      let nearestDist = Infinity;

      // Check if near a quadrant center — if so, push away from it
      for (const qc of QUADRANT_CENTERS) {
        const d = Math.sqrt((point.progress - qc.progress) ** 2 + (point.volume - qc.volume) ** 2);
        if (d < QUADRANT_PUSH) {
          const dx = point.volume - qc.volume;
          const dy = point.progress - qc.progress;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) { bestDx = dx / len; bestDy = dy / len; }
          nearestDist = 0;
          break;
        }
      }

      // Fall back to pushing away from nearest labeled point
      if (nearestDist !== 0) {
        for (const other of chartData) {
          if (!labeledSet.has(other.muscleId)) continue;
          const d = dist(point, other);
          if (d < nearestDist) {
            nearestDist = d;
            const dx = point.volume - other.volume;
            const dy = point.progress - other.progress;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) { bestDx = dx / len; bestDy = dy / len; }
            else { bestDx = 1; bestDy = 0; }
          }
        }
      }

      dirs.set(point.muscleId, { dx: bestDx, dy: bestDy });
    }
    return dirs;
  }, [chartData, labeledIds]);

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d: ChartPoint | undefined = payload[0]?.payload;
    if (!d) return null;

    const quadrantDesc: Record<string, { desc: string; advice: string }> = {
      'Volume Focus': { desc: 'High volume but lagging strength progress', advice: 'Focus on progressive overload, add weight or reps slowly' },
      'Optimal Growth': { desc: 'High volume + strong progress, ideal for hypertrophy', advice: 'Keep it up! Maintain this balance for gains' },
      'Undertrained': { desc: 'Low volume + low progress', advice: 'If prioritizing this muscle, add sets and train 2-3x/week' },
      'Strength Focus': { desc: 'Strong progress despite low volume', advice: 'Consider increasing volume for more size gains' },
    };

    const q = quadrantDesc[d.quadrant];
    return (
      <div className="rounded-lg px-3 py-2 shadow-2xl border text-xs"
        style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.95)', borderColor: 'rgb(var(--border-rgb) / 0.5)', color: 'var(--text-primary)' }}>
        <p className="font-semibold mb-1.5" style={SEMI_FANCY_FONT}>{d.name} <span className="opacity-60 font-normal">({d.total}/100)</span></p>
        <div className="flex items-center gap-3 mb-1.5">
          <span>Progress <b style={{ color: progColor(d.progress) }}>{d.progress}/40</b></span>
          <span>Volume <b style={{ color: volColor(d.volume) }}>{d.volume}/50</b></span>
        </div>
        <div className="border-t pt-1.5 text-slate-400" style={{ borderColor: 'rgb(var(--border-rgb) / 0.3)' }}>
          <p className="font-semibold text-[10px]">{d.quadrant}</p>
          <p className="text-[9px] leading-tight mt-0.5">{q.desc}</p>
          <p className="text-[8px] mt-1">{q.advice}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/70 rounded-xl border border-slate-700/50 overflow-hidden h-[400px] sm:h-[450px] lg:h-full flex flex-col">
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-white">Hypertrophy Scatter Plot</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Progress vs Volume per muscle</p>
          </div>
          <SegmentControl
            options={[
              { value: '7d', label: 'lst wk', title: 'Last 7 days' },
              { value: '30d', label: 'lst mo', title: 'Last 30 days' },
            ]}
            value={hypertrophyPeriod}
            onChange={(v) => setHypertrophyPeriod(v as '7d' | '30d')}
          />
        </div>
      </div>

      <div className="flex-1 w-full relative" style={{ minHeight: 300 }}>
        {hypertrophyData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <ReScatterChart margin={{ top: 28, right: 8, bottom: 28, left: 0 }}>
                <XAxis type="number" dataKey="volume" domain={[0, 50]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#475569' }}
                  label={{ value: 'Volume Score (0–50)', position: 'bottom', offset: 5, fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <YAxis type="number" dataKey="progress" domain={[0, 50]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#475569' }} width={28}
                  label={{ value: 'Progressive Overload (0–40)', angle: 0, position: 'insideTop', offset: -18, dx: +60, fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />

                <ReferenceArea x1={0} x2={VOLUME_MID} y1={0} y2={PROGRESS_MID} fill="rgba(239,68,68,0.12)"
                  label={{ value: 'Neglected', position: 'center', fill: '#ef4444', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                <ReferenceArea x1={VOLUME_MID} x2={50} y1={0} y2={PROGRESS_MID} fill="rgba(245,158,11,0.12)"
                  label={{ value: 'Volume Focus', position: 'center', fill: '#f59e0b', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                <ReferenceArea x1={0} x2={VOLUME_MID} y1={PROGRESS_MID} y2={50} fill="rgba(59,130,246,0.12)"
                  label={{ value: 'Efficiency Zone', position: 'center', fill: '#3b82f6', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                <ReferenceArea x1={VOLUME_MID} x2={50} y1={PROGRESS_MID} y2={50} fill="rgba(34,197,94,0.12)"
                  label={{ value: 'Optimal Growth', position: 'center', fill: '#22c55e', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />


                <RechartsTooltip content={<CustomScatterTooltip />} />

                <Scatter data={chartData} shape="circle" isAnimationActive={false}>
                  {chartData.map((entry) => {
                    const c = getDotColor(entry.total);
                    return (
                      <Cell
                        key={entry.muscleId}
                        fill={c}
                        fillOpacity={0.85}
                        stroke={c}
                        strokeWidth={0.5}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Scatter>

                <Scatter data={chartData} isAnimationActive={false} legendType="none"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (cx == null || cy == null || !payload) return null;
                    const isDirect = labeledIds.includes(payload.muscleId);
                    const name = payload.name;
                    if (isDirect) {
                      return (
                        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={10} fill="#7f7b7b" fontWeight={600} fontFamily={'"Lora", serif'} fontStyle="italic">
                          {name}
                        </text>
                      );
                    }
                    const dir = unlabeledDirs.get(payload.muscleId) ?? { dx: 1, dy: 0 };
                    const OFFSET = 20;
                    const lx = cx + dir.dx * OFFSET;
                    const ly = cy - dir.dy * OFFSET;
                    return (
                      <text x={lx} y={ly} dy="0.32em" textAnchor="middle" fontSize={10} fill="#7f7b7b" fontWeight={600} fontFamily={'"Lora", serif'} fontStyle="italic">
                          {name}
                        </text>
                    );
                  }} />
              </ReScatterChart>
            </ResponsiveContainer>

           
          </>
        ) : (
          <div className="text-[10px] text-slate-500 py-4 text-center">No muscle data available.</div>
        )}
      </div>
   
    </div>
  );
};
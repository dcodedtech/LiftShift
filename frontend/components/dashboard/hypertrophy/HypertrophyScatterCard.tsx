import React, { useMemo } from 'react';
import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from 'recharts';
import { SegmentControl } from '../../ui/SegmentControl';
import { SEMI_FANCY_FONT } from '../../../utils/ui/uiConstants';
import {
  FACTOR_WEIGHTS,
  type MuscleHypertrophyData,
} from '../../../utils/muscle/hypertrophy/hypertrophyScore';

const PROGRESS_MID = 20;
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
  weeklySets: number;
  oneRMTrend: number;
  daysPerWeek: number;
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

// ── Label placement tunables ──
const LABEL_OFFSET_DATA = 1.5;          // Data units from dot to label (~= LABEL_OFFSET_PX / 8)
const LABEL_OFFSET_PX = 10;             // Pixel distance from dot to rendered label
const MIN_LABEL_DISTANCE = 3.5;           // Min visual-distance-adjusted data units between labels before repulsion
const COLLISION_ITERATIONS = 15;        // Repulsion iterations (higher = better convergence)
const TEXT_ANCHOR_THRESHOLD = 0.3;      // |dx| above this switches text anchor to start/end

const RIGHT_EDGE_THRESHOLD = 46;        // Volume above this → label moves left
const LEFT_EDGE_THRESHOLD = 4;         // Volume below this → label moves right
const TOP_EDGE_THRESHOLD = 37;          // Progress above this → label moves below
const BOTTOM_EDGE_THRESHOLD = 4;        // Progress below this → label moves above

const COLLISION_REPULSION_DAMPING = 0.5;// Damping for label-label repulsion (0-1); <1 prevents oscillation with variable distance
const COLLISION_DIST_GAIN = 0.3;        // How much colliding labels extend further from their dot (0 = fixed distance)

// Scale volume differences by 0.8 so Euclidean distance in data-space
// approximates visual distance (volume range 50 vs progress range 40)
const AXIS_RATIO = 0.8;
// ─────────────────────────────────

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
        weeklySets: m.score.raw.weeklySets,
        oneRMTrend: m.score.raw.oneRMTrend,
        daysPerWeek: m.score.raw.daysPerWeek,
      };
    }),
    [hypertrophyData]
  );

  const labelDirs = useMemo(() => {
    // Each label: { dx, dy } = unit direction, dist = distance multiplier (1 = LABEL_OFFSET_PX)
    const dirs = new Map<string, { dx: number; dy: number; dist: number }>();
    const pts = chartData;
    if (pts.length === 0) return dirs;

    for (const p of pts) {
      // Default: label below the dot (dir.dy = -1 → ly = cy + 12)
      let dx = 0, dy = -1;

      // Zone text avoidance: when the dot is just above a quadrant label row
      // (y=10 or y=30), flip the label to sit ABOVE the dot instead (dir.dy = 1).
      if ((p.progress >= 11 && p.progress <= 13) || (p.progress >= 31 && p.progress <= 33)) dy = 1;

      // Edge overrides (chart boundary takes priority)
      if (p.progress > TOP_EDGE_THRESHOLD) dy = -1;    // near top → push DOWN
      else if (p.progress < BOTTOM_EDGE_THRESHOLD) dy = 1; // near bottom → push UP
      if (p.volume > RIGHT_EDGE_THRESHOLD) dx = -1;    // near right → push LEFT
      else if (p.volume < LEFT_EDGE_THRESHOLD) dx = 1;  // near left → push RIGHT

      const len = Math.hypot(dx, dy);
      if (len > 0.01) { dx /= len; dy /= len; }
      dirs.set(p.muscleId, { dx, dy, dist: 1 });
    }

    for (let iter = 0; iter < COLLISION_ITERATIONS; iter++) {
      const pushes = new Map<string, { dx: number; dy: number; ddist: number }>();
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const da = dirs.get(a.muscleId)!, db = dirs.get(b.muscleId)!;

          // Predicted label position in data space, accounting for variable distance
          const ax = a.volume + da.dx * LABEL_OFFSET_DATA * da.dist;
          const ay = a.progress - da.dy * LABEL_OFFSET_DATA * da.dist;
          const bx = b.volume + db.dx * LABEL_OFFSET_DATA * db.dist;
          const by = b.progress - db.dy * LABEL_OFFSET_DATA * db.dist;

          // Scale x-axis diff by AXIS_RATIO so Euclidean distance ≈ visual distance
          // (volume range 50 vs progress range 40)
          const dx = (bx - ax) * AXIS_RATIO;
          const dy = by - ay;
          const d = Math.hypot(dx, dy);

          if (d < MIN_LABEL_DISTANCE && d > 0.01) {
            const f = (MIN_LABEL_DISTANCE - d) / MIN_LABEL_DISTANCE * COLLISION_REPULSION_DAMPING;
            const nx = dx / d, ny = dy / d;

            const pa = pushes.get(a.muscleId) ?? { dx: 0, dy: 0, ddist: 0 };
            pa.dx -= nx * f; pa.dy -= ny * f;
            pa.ddist += f * COLLISION_DIST_GAIN; // push label further from dot
            pushes.set(a.muscleId, pa);

            const pb = pushes.get(b.muscleId) ?? { dx: 0, dy: 0, ddist: 0 };
            pb.dx += nx * f; pb.dy += ny * f;
            pb.ddist += f * COLLISION_DIST_GAIN;
            pushes.set(b.muscleId, pb);
          }
        }
      }

      for (const [id, push] of pushes) {
        const d = dirs.get(id)!;
        d.dx += push.dx; d.dy += push.dy;
        d.dist = Math.min(Math.max(d.dist + push.ddist, 1), 3.5); // clamp dist to [1, 3.5]
        const len = Math.hypot(d.dx, d.dy);
        if (len > 0.01) { d.dx /= len; d.dy /= len; }
      }
    }
    return dirs;
  }, [chartData]);

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d: ChartPoint | undefined = payload[0]?.payload;
    if (!d) return null;

    const sets = d.weeklySets.toFixed(1);
    const trend = `${d.oneRMTrend > 0 ? '+' : ''}${d.oneRMTrend.toFixed(1)}%`;
    const vc = volColor(d.volume);
    const pc = progColor(d.progress);

    const quadrantAdvice: Record<string, { desc: React.ReactNode; advice: string }> = {
      'Volume Focus': {
        desc: <>High volume (<span style={{color:vc}}>{sets} sets/wk</span>) but lagging strength progress (<span style={{color:pc}}>{trend}</span>)</>,
        advice: 'Focus on progressive overload — add weight or reps slowly',
      },
      'Optimal Growth': {
        desc: <>High volume (<span style={{color:vc}}>{sets} sets/wk</span>) + strong progress (<span style={{color:pc}}>{trend}</span>)</>,
        advice: 'Keep it up! this balance is ideal for hypertrophy',
      },
      'Undertrained': {
        desc: <>Low volume (<span style={{color:vc}}>{sets} sets/wk</span>) + low progress (<span style={{color:pc}}>{trend}</span>)</>,
        advice: 'If prioritizing this muscle, add sets and train 2-3x/week',
      },
      'Strength Focus': {
        desc: <>Strong progress (<span style={{color:pc}}>{trend}</span>) despite low volume (<span style={{color:vc}}>{sets} sets/wk</span>)</>,
        advice: 'Consider increasing volume for more size gains',
      },
    };

    const q = quadrantAdvice[d.quadrant];
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
    <div className="bg-black/70 rounded-xl border border-slate-700/50 overflow-hidden h-[400px] sm:h-[450px] lg:h-[550px] flex flex-col">
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
                <YAxis type="number" dataKey="progress" domain={[0, 40]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#475569' }} width={28}
                  label={{ value: 'Progressive Overload (0–40)', angle: 0, position: 'insideTop', offset: -18, dx: +60, fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />

                <ReferenceArea x1={0} x2={VOLUME_MID} y1={0} y2={PROGRESS_MID} fill="rgba(239,68,68,0.12)"
                  label={{ value: 'Neglected', position: 'center', fill: '#ef4444', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                <ReferenceArea x1={VOLUME_MID} x2={50} y1={0} y2={PROGRESS_MID} fill="rgba(245,158,11,0.12)"
                  label={{ value: 'Volume Focus', position: 'center', fill: '#f59e0b', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                <ReferenceArea x1={0} x2={VOLUME_MID} y1={PROGRESS_MID} y2={40} fill="rgba(59,130,246,0.12)"
                  label={{ value: 'Efficiency Zone', position: 'center', fill: '#3b82f6', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                <ReferenceArea x1={VOLUME_MID} x2={50} y1={PROGRESS_MID} y2={40} fill="rgba(34,197,94,0.12)"
                  label={{ value: 'Optimal Growth', position: 'center', fill: '#22c55e', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />


                <RechartsTooltip cursor={false} content={<CustomScatterTooltip />} />

                <Scatter data={chartData} isAnimationActive={false}
                  shape={({ cx, cy, fill }: any) =>
                    cx != null && cy != null ? <>
                      <circle cx={cx} cy={cy} r={14} fill="transparent" stroke="none" style={{ cursor: 'crosshair' }} />
                      <circle cx={cx} cy={cy} r={3} fill={fill} fillOpacity={0.15} stroke="none" pointerEvents="none" />
                    </> : null
                  }>
                  {chartData.map((entry) => {
                    const c = getDotColor(entry.total);
                    return <Cell key={entry.muscleId} fill={c} />;
                  })}
                </Scatter>

                <Scatter data={chartData} isAnimationActive={false} legendType="none"
                  shape={({ cx, cy, payload }: any) => {
                    if (cx == null || cy == null || !payload) return null;
                    const dir = labelDirs.get(payload.muscleId) ?? { dx: 0, dy: -1, dist: 1 };
                    const lx = cx + dir.dx * LABEL_OFFSET_PX * dir.dist;
                    const ly = cy - dir.dy * LABEL_OFFSET_PX * dir.dist;
                    const anchor = dir.dx > TEXT_ANCHOR_THRESHOLD ? 'start' : dir.dx < -TEXT_ANCHOR_THRESHOLD ? 'end' : 'middle';
                    return (
                      <text x={lx} y={ly}
                        dy="0.32em" textAnchor={anchor} fontSize={10} fill="#7f7b7b"
                        fontWeight={600} fontFamily={'"Lora", serif'} fontStyle="italic"
                        style={{ cursor: 'crosshair' }}>
                        {payload.name}
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
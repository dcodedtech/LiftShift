import React, { memo, useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, eachDayOfInterval, getDay } from 'date-fns';
import { Target } from 'lucide-react';
import type { DailySummary } from '../../../types';
import { computationCache } from '../../../utils/storage/computationCache';
import { formatHumanReadableDate, formatMonthYearContraction } from '../../../utils/date/dateUtils';
import { Tooltip as HoverTooltip, type TooltipData } from '../../ui/Tooltip';
import { Sparkline, StreakBadge } from '../../insights/InsightCards';
import type { SparklinePoint, StreakInfo } from '../../../utils/analysis/insights';

const DashboardTooltip: React.FC<{ data: TooltipData }> = ({ data }) => {
  return <HoverTooltip data={data} />;
};

export const ActivityHeatmap = memo(({
  dailyData,
  streakInfo,
  consistencySparkline,
  onDayClick,
  now,
}: {
  dailyData: DailySummary[];
  streakInfo: StreakInfo;
  consistencySparkline: SparklinePoint[];
  onDayClick?: (date: Date) => void;
  now?: Date;
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const currentMonthEnd = useMemo(() => endOfMonth(today), [today]);

  const heatmapData = useMemo(() => {
    return computationCache.getOrCompute(
      'heatmapData',
      dailyData,
      () => {
        if (dailyData.length === 0) return [];

        const byDayKey = new Map<string, DailySummary>();
        for (const d of dailyData) {
          byDayKey.set(format(new Date(d.timestamp), 'yyyy-MM-dd'), d);
        }

        const firstDate = new Date(dailyData[0].timestamp);
        const lastDateWithData = new Date(dailyData[dailyData.length - 1].timestamp);
        const futureEnd = endOfMonth(today);
        const lastDate = futureEnd.getTime() > lastDateWithData.getTime() ? futureEnd : lastDateWithData;
        const days = eachDayOfInterval({ start: firstDate, end: lastDate });

        return days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const activity = byDayKey.get(key);
          const isFuture = day.getTime() > today.getTime();
          const isCurrentMonthFuture = isFuture && day.getTime() <= currentMonthEnd.getTime();
          return {
            date: day,
            count: activity?.sets ?? 0,
            totalVolume: activity?.totalVolume ?? 0,
            title: activity?.workoutTitle ?? null,
            isFuture,
            isCurrentMonthFuture,
          };
        });
      },
      { ttl: 10 * 60 * 1000 }
    );
  }, [dailyData, today]);

  const monthBlocks = useMemo(() => {
    type MonthBlock = { key: string; label: string; cells: Array<any | null> };

    if (heatmapData.length === 0) return [] as MonthBlock[];

    const byKey = new Map<string, any>();
    for (const d of heatmapData) {
      byKey.set(format(d.date, 'yyyy-MM-dd'), d);
    }

    const rangeStart = heatmapData[0].date as Date;
    const rangeEnd = heatmapData[heatmapData.length - 1].date as Date;

    const blocks: MonthBlock[] = [];
    let cursor = startOfMonth(rangeStart);

    while (cursor.getTime() <= rangeEnd.getTime()) {
      const monthStart = cursor;
      const monthEnd = endOfMonth(monthStart);

      const visibleStart = monthStart.getTime() < rangeStart.getTime() ? rangeStart : monthStart;
      const visibleEnd = monthEnd.getTime() > rangeEnd.getTime() ? rangeEnd : monthEnd;

      const days = eachDayOfInterval({ start: visibleStart, end: visibleEnd });
      const dayOfWeekOffset = (getDay(visibleStart) + 6) % 7;
      const totalCells = Math.ceil((dayOfWeekOffset + days.length) / 7) * 7;
      const cells: Array<any | null> = new Array(totalCells).fill(null);

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const existing = byKey.get(format(day, 'yyyy-MM-dd'));
        const isFuture = day.getTime() > today.getTime();
        const isCurrentMonthFuture = isFuture && day.getTime() <= currentMonthEnd.getTime();
        cells[dayOfWeekOffset + i] = existing || { date: day, count: 0, title: null, isFuture, isCurrentMonthFuture };
      }

      blocks.push({
        key: format(monthStart, 'yyyy-MM'),
        label: formatMonthYearContraction(monthStart),
        cells,
      });

      cursor = addMonths(cursor, 1);
    }

    return blocks;
  }, [heatmapData, today]);

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = Math.max(
            0,
            scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
          );
        }
      }, 100);
    });
  }, [heatmapData]);

  if (heatmapData.length === 0) return null;

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayInRange = heatmapData.some(d => format(d.date, 'yyyy-MM-dd') === todayStr);
  const maxVolume = Math.max(...heatmapData.map(d => d.totalVolume), 1);

  const getColor = (volume: number, isFuture?: boolean, isCurrentMonthFuture?: boolean) => {
    if (isCurrentMonthFuture) return { bgClass: 'bg-slate-800/20 border border-slate-700/20', style: { opacity: 0.6 } };
    if (isFuture) return { bgClass: 'bg-slate-800/40 border border-slate-700/50', style: {} };
    if (volume === 0) return { bgClass: 'bg-slate-800/50', style: {} };

    const intensity = Math.min(volume / maxVolume, 1);
    const lightness = 25 + (intensity * 40);
    const saturation = 70 + (intensity * 20);

    return { bgClass: '', style: { backgroundColor: `hsl(160, ${saturation}%, ${lightness}%)` } };
  };

  const getDayTextColor = (volume: number, isFuture?: boolean, isCurrentMonthFuture?: boolean) => {
    if (isCurrentMonthFuture) return 'text-slate-500/30';
    if (isFuture) return 'text-slate-600';
    if (volume === 0) return 'text-slate-600';

    const intensity = Math.min(volume / maxVolume, 1);
    const lightness = 25 + (intensity * 40);
    
    return lightness < 40 ? 'text-white' : 'text-slate-900';
  };


  const handleMouseEnter = (e: React.MouseEvent, day: any) => {
    if (!day || day.count === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      rect,
      title: formatHumanReadableDate(day.date, { now }),
      body: `${day.totalVolume.toLocaleString()} kg${day.title ? `\n${day.title}` : ''}`,
      footer: 'Click to view details',
      status: (day.totalVolume > 3000 ? 'success' : 'info') as TooltipData['status'],
    });
  };

  return (
    <div className="bg-black/70 border border-slate-700/50 p-4 sm:p-5 rounded-xl flex flex-col lg:flex-row gap-4 lg:gap-5 overflow-hidden">
      <div className="flex-shrink-0 min-w-[160px] sm:min-w-[200px] lg:min-w-[240px] border-b lg:border-b-0 lg:border-r border-slate-700/50 pb-4 lg:pb-0 lg:pr-6 lg:flex lg:flex-col">
        <div className="flex flex-col gap-3 lg:flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Consistency</span>
            </div>
            <StreakBadge streak={streakInfo} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 lg:flex-1 lg:h-full lg:grid-rows-[1fr_auto]">
            <div className="row-span-2 flex flex-col justify-center items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{streakInfo.consistencyScore}</span>
                <span className="text-lg text-slate-500">%</span>
              </div>
            </div>

            <div className="row-span-2 flex items-center justify-end">
              <Sparkline data={consistencySparkline} color="#10b981" height={24} title="Workout consistency over last 8 weeks" />
            </div>

            <div className="flex items-center justify-start">
              <span className="text-xs text-slate-500">{streakInfo.avgWorkoutsPerWeek} days/wk</span>
            </div>

            <div className="flex items-center justify-end">
              {todayInRange && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span>Less</span>
                  <div className="flex gap-0.5">
                    {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => {
                      const lightness = 25 + (intensity * 40);
                      const saturation = 70 + (intensity * 20);
                      const bgClass = intensity === 0 ? 'bg-slate-800/50' : '';
                      const style = intensity === 0 ? {} : { backgroundColor: `hsl(160, ${saturation}%, ${lightness}%)` };
                      return <div key={i} className={`w-2.5 h-2.5 rounded ${bgClass}`} style={style} />;
                    })}
                  </div>
                  <span>More</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-x-auto pb-2 custom-scrollbar" ref={scrollContainerRef}>
        <div className="w-max">
          <div className="grid grid-flow-col grid-rows-[auto_auto] auto-cols-max items-start gap-x-3 gap-y-2">
            {monthBlocks.map((month, monthIdx) => {
              const isLatestMonth = monthIdx === monthBlocks.length - 1;
              const cellSizeClass = isLatestMonth ? 'w-[18px] h-[18px]' : 'w-2 h-2';
              const dayGapClass = isLatestMonth ? 'gap-1' : 'gap-[2px]';
              const dayOfWeekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              return (
              <div
                key={month.key}
                className={`flex flex-col items-center ${isLatestMonth ? 'row-span-2' : ''}`}
                style={isLatestMonth ? { gridRow: '1 / span 2' } : undefined}
              >
                <div className="h-5 mb-1 flex items-center justify-center text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  {month.label}
                </div>
                {isLatestMonth && (
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayOfWeekLabels.map((label, i) => (
                      <div key={i} className="w-[18px] h-3 flex items-center justify-center text-[9px] text-slate-600 font-medium">
                        {label}
                      </div>
                    ))}
                  </div>
                )}
                <div className={`relative z-10 grid grid-cols-7 ${dayGapClass} justify-items-center items-center`}>
                    {month.cells.map((day, idx) => {
                      if (!day) return <div key={`${month.key}-empty-${idx}`} className={cellSizeClass} />;
                      const dayNum = day.date.getDate();
                      const isFuture = day.isFuture;
                      const isCurrentMonthFuture = day.isCurrentMonthFuture;
                      const isToday = format(day.date, 'yyyy-MM-dd') === todayStr;
                      const { bgClass, style } = getColor(day.totalVolume, isFuture, isCurrentMonthFuture);
                      const textColor = isLatestMonth ? getDayTextColor(day.totalVolume, isFuture, isCurrentMonthFuture) : '';
                      return (
                        <div
                          key={day.date.toISOString()}
                          className={`${cellSizeClass} rounded flex items-center justify-center text-[8px] font-medium ${bgClass} ${textColor} transition-all duration-300 ${day.totalVolume > 0 && !isFuture ? 'cursor-pointer hover:ring-2 hover:ring-white/30' : 'cursor-default'} ${isToday ? 'ring-2 ring-blue-400/70' : ''}`}
                          style={style}
                          onClick={() => day.count > 0 && !isFuture && onDayClick?.(day.date)}
                          onMouseEnter={(e) => !isFuture && handleMouseEnter(e, day)}
                          onMouseLeave={() => !isFuture && setTooltip(null)}
                        >
                          {isLatestMonth && dayNum <= 31 && dayNum}
                        </div>
                      );
                    })}
                  </div>
                </div>
            );
            })}
          </div>
        </div>
      </div>

      {tooltip && <DashboardTooltip data={tooltip} />}
    </div>
  );
});

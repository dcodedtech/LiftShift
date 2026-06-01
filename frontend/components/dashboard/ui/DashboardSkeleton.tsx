import React from 'react';
import { ChartSkeleton } from '../../ui/ChartSkeleton';

const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-lg animate-pulse ${className}`}
    style={{
      backgroundColor: 'rgb(var(--border-rgb) / 0.12)',
    }}
  />
);

const MiniStatCard: React.FC = () => (
  <div
    className="flex-1 rounded-lg p-3 flex items-center gap-3"
    style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.4)' }}
  >
    <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'rgb(var(--border-rgb) / 0.18)' }} />
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="h-3 w-12 rounded animate-pulse" style={{ backgroundColor: 'rgb(var(--border-rgb) / 0.12)' }} />
      <div className="h-4 w-8 rounded animate-pulse" style={{ backgroundColor: 'rgb(var(--border-rgb) / 0.15)' }} />
    </div>
  </div>
);

const MiniCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-lg p-3 animate-pulse flex-1 ${className}`}
    style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.4)' }}
  >
    <div className="h-2.5 w-1/2 rounded mb-2" style={{ backgroundColor: 'rgb(var(--border-rgb) / 0.15)' }} />
    <div className="h-4 w-1/3 rounded" style={{ backgroundColor: 'rgb(var(--border-rgb) / 0.2)' }} />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-2 pb-2">
    {/* Stats header bar */}
    <div className="flex gap-2 sm:gap-3">
      <MiniStatCard />
      <MiniStatCard />
      <MiniStatCard />
    </div>

    {/* Summary card */}
    <div
      className="rounded-xl p-4 flex items-start gap-3"
      style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.4)' }}
    >
      <div className="w-8 h-8 rounded-lg animate-pulse flex-shrink-0" style={{ backgroundColor: 'rgb(var(--border-rgb) / 0.15)' }} />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonPulse className="h-3 w-16" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-3/4" />
      </div>
    </div>

    {/* Insights row */}
    <div className="flex gap-2">
      <MiniCard />
      <MiniCard />
      <MiniCard />
      <MiniCard />
    </div>

    {/* PR panel + Plateau + Timeline placeholders */}
    <div className="flex flex-col gap-2">
      <SkeletonPulse className="h-28 w-full" />
      <SkeletonPulse className="h-20 w-full" />
    </div>

    {/* Activity heatmap */}
    <SkeletonPulse className="h-32 w-full" />

    {/* Primary charts grid 2×2 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />
      <ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <ChartSkeleton className="h-[350px] sm:h-[450px]" />
      <ChartSkeleton className="h-[350px] sm:h-[450px]" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <ChartSkeleton className="h-[350px] sm:h-[450px]" />
      <ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />
    </div>

    {/* Secondary charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2">
      <ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />
      <ChartSkeleton className="min-h-[400px] sm:min-h-[480px]" />
    </div>
  </div>
);

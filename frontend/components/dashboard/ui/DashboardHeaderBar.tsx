import React from 'react';
import { Clock } from 'lucide-react';
import { ViewHeader } from '../../layout/ViewHeader';

interface DashboardHeaderBarProps {
  totalWorkouts: number;
  filtersSlot?: React.ReactNode;
  stickyHeader: boolean;
}

export const DashboardHeaderBar: React.FC<DashboardHeaderBarProps> = ({
  totalWorkouts,
  filtersSlot,
  stickyHeader,
}) => (
  <div className="hidden sm:contents">
    <ViewHeader
      leftStats={[{ icon: Clock, value: totalWorkouts, label: 'Workouts' }]}
      filtersSlot={filtersSlot}
      sticky={stickyHeader}
    />
  </div>
);

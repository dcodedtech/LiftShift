import React from 'react';
import { Clock } from 'lucide-react';
import { ViewHeader } from '../../layout/ViewHeader';
import { formatLargeNumber } from '../../../utils/data/comparisonData';

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
      leftStats={[{ icon: Clock, value: formatLargeNumber(totalWorkouts), label: 'Workouts' }]}
      filtersSlot={filtersSlot}
      sticky={stickyHeader}
    />
  </div>
);

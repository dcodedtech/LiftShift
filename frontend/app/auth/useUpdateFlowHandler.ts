import { useCallback } from 'react';
import { trackEvent } from '../../utils/integrations/analytics';
import type { OnboardingFlow } from '../onboarding/types';

interface UpdateFlowArgs {
  dataSource: string | null;
  setOnboarding: (next: OnboardingFlow | null) => void;
  clearCsvImportError: () => void;
  clearHevyLoginError: () => void;
  clearLyfatLoginError: () => void;
}

const VALID_PLATFORMS = ['strong', 'hevy', 'lyfta', 'other', 'motra'] as const;

export const useUpdateFlowHandler = ({
  dataSource,
  setOnboarding,
  clearCsvImportError,
  clearHevyLoginError,
  clearLyfatLoginError,
}: UpdateFlowArgs) => {
  return useCallback(() => {
    trackEvent('update_flow_open', { data_source: dataSource ?? 'unknown' });
    clearCsvImportError();
    clearHevyLoginError();
    clearLyfatLoginError();

    const platform = VALID_PLATFORMS.includes(dataSource as typeof VALID_PLATFORMS[number])
      ? (dataSource as typeof VALID_PLATFORMS[number])
      : 'other';

    setOnboarding({ intent: 'update', step: 'unified_modal', platform });
  }, [dataSource, clearCsvImportError, clearHevyLoginError, clearLyfatLoginError, setOnboarding]);
};

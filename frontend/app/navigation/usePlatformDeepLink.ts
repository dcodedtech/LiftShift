import type React from 'react';
import { useEffect } from 'react';
import type { NavigateFunction } from 'react-router';

import type { OnboardingFlow } from '../onboarding/types';
import { trackEvent } from '../../utils/integrations/analytics';
import { getSetupComplete } from '../../utils/storage/dataSourceStorage';

export const usePlatformDeepLink = ({
  location,
  navigate,
  setOnboarding,
  platformQueryConsumedRef,
}: {
  location: { pathname: string; search: string };
  navigate: NavigateFunction;
  setOnboarding: React.Dispatch<React.SetStateAction<OnboardingFlow | null>>;
  platformQueryConsumedRef: React.MutableRefObject<boolean>;
}): void => {
  useEffect(() => {
    if (platformQueryConsumedRef.current) return;
    const params = new URLSearchParams(location.search);
    const platform = params.get('platform');
    if (!platform) return;

    const isKnown =
      platform === 'hevy' ||
      platform === 'strong' ||
      platform === 'lyfta' ||
      platform === 'other';
    if (!isKnown) return;

    trackEvent('deep_link_platform', { platform });

    platformQueryConsumedRef.current = true;

    const intent = getSetupComplete() ? 'update' : 'initial';
    setOnboarding({
      intent,
      step: 'unified_modal',
      platform: platform as 'hevy' | 'strong' | 'lyfta' | 'other',
    });

    params.delete('platform');
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname || '/',
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true },
    );
  }, [
    location.pathname,
    location.search,
    navigate,
    platformQueryConsumedRef,
    setOnboarding,
  ]);
};

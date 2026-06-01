import type { DataSourceChoice } from '../../utils/storage/dataSourceStorage';

export type OnboardingIntent = 'initial' | 'update';

export type OnboardingStep =
  | 'platform'
  | 'add_source_platform'
  | 'demo_prefs'
  | 'unified_modal';

export type OnboardingFlow = {
  intent: OnboardingIntent;
  step: OnboardingStep;
  platform?: DataSourceChoice;
  backStep?: OnboardingStep;
};

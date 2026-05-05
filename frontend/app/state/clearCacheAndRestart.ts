import { trackEvent, resetUser } from '../../utils/integrations/analytics';
import { computationCache } from '../../utils/storage/computationCache';
import { browserCache } from '../../utils/storage/browserCache';
import {
  clearBodyMapGender,
  clearCSVData,
  clearDateMode,
  clearPreferencesConfirmed,
  clearThemeMode,
  clearWeightUnit,
} from '../../utils/storage/localStorage';
import {
  clearDataSourceChoice,
  clearHevyAuthToken,
  clearLastCsvPlatform,
  clearLastLoginMethod,
  clearCombinedDataSources,
  clearSetupComplete,
} from '../../utils/storage/dataSourceStorage';
import {
  clearHevyProApiKey,
  clearLyftaApiKey,
} from '../../utils/storage/hevyCredentialsStorage';

export const clearCacheAndRestart = (): void => {
  trackEvent('cache_clear', {});
  resetUser();
  clearCSVData();
  clearHevyAuthToken();
  clearHevyProApiKey();
  clearLyftaApiKey();
  clearDataSourceChoice();
  clearLastCsvPlatform();
  clearLastLoginMethod();
  clearCombinedDataSources();
  clearSetupComplete();
  clearWeightUnit();
  clearBodyMapGender();
  clearPreferencesConfirmed();
  clearThemeMode();
  clearDateMode();
  computationCache.clear();
  browserCache.clearAllCache();
  window.location.reload();
};

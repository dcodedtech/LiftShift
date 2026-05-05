const HEVY_USERNAME_KEY = 'hevy_username_or_email';
const HEVY_PASSWORD_KEY = 'hevy_password';
const HEVY_PRO_API_KEY = 'hevy_pro_api_key';
const LYFTA_API_KEY = 'lyfta_api_key';

export const saveHevyUsernameOrEmail = (value: string): void => {
  try {
    localStorage.setItem(HEVY_USERNAME_KEY, value);
  } catch {
  }
};

export const getHevyUsernameOrEmail = (): string | null => {
  try {
    return localStorage.getItem(HEVY_USERNAME_KEY);
  } catch {
    return null;
  }
};

export const clearHevyUsernameOrEmail = (): void => {
  try {
    localStorage.removeItem(HEVY_USERNAME_KEY);
  } catch {
  }
};

export const saveHevyPassword = (password: string): void => {
  try {
    localStorage.setItem(HEVY_PASSWORD_KEY, password);
  } catch {
  }
};

export const getHevyPassword = (): string | null => {
  try {
    return localStorage.getItem(HEVY_PASSWORD_KEY);
  } catch {
    return null;
  }
};

export const clearHevyPassword = (): void => {
  try {
    localStorage.removeItem(HEVY_PASSWORD_KEY);
  } catch {
  }
};

export const clearHevyCredentials = (): void => {
  clearHevyUsernameOrEmail();
  clearHevyPassword();
};

export const saveHevyProApiKey = (apiKey: string): void => {
  try {
    localStorage.setItem(HEVY_PRO_API_KEY, apiKey);
  } catch {
  }
};

export const getHevyProApiKey = (): string | null => {
  try {
    return localStorage.getItem(HEVY_PRO_API_KEY);
  } catch {
    return null;
  }
};

export const clearHevyProApiKey = (): void => {
  try {
    localStorage.removeItem(HEVY_PRO_API_KEY);
  } catch {
  }
};

export const saveLyftaApiKey = (apiKey: string): void => {
  try {
    localStorage.setItem(LYFTA_API_KEY, apiKey);
  } catch {
  }
};

export const getLyftaApiKey = (): string | null => {
  try {
    return localStorage.getItem(LYFTA_API_KEY);
  } catch {
    return null;
  }
};

export const clearLyftaApiKey = (): void => {
  try {
    localStorage.removeItem(LYFTA_API_KEY);
  } catch {
  }
};

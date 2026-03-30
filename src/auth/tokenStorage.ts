import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REDIRECT_PATH_KEY = 'redirectPath';
const LAST_PROVIDER_KEY = 'lastProvider';

// React Native(비웹) 환경용 메모리 폴백
const memoryStore: Record<string, string> = {};

const store = {
  get: (key: string): string | null => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return memoryStore[key] ?? null;
  },
  set: (key: string, value: string): void => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
    }
  },
  remove: (key: string): void => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      delete memoryStore[key];
    }
  },
};

export const getAccessToken = (): string | null => store.get(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => store.get(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string): void => {
  store.set(ACCESS_TOKEN_KEY, accessToken);
  store.set(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  store.remove(ACCESS_TOKEN_KEY);
  store.remove(REFRESH_TOKEN_KEY);
};

export const setRedirectPath = (path: string): void => store.set(REDIRECT_PATH_KEY, path);
export const getRedirectPath = (): string | null => store.get(REDIRECT_PATH_KEY);
export const clearRedirectPath = (): void => store.remove(REDIRECT_PATH_KEY);

export const setLastProvider = (provider: string): void => store.set(LAST_PROVIDER_KEY, provider);
export const getLastProvider = (): string | null => store.get(LAST_PROVIDER_KEY);

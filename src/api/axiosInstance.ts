import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../auth/tokenStorage';
import { resetToLogin } from '../auth/navigationRef';
import { BACKEND_DOMAIN } from '../utils/Server';

// 토큰 재발급 대기 중인 요청들의 큐
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const flushQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: BACKEND_DOMAIN,
  timeout: 10000,
});

// 요청 인터셉터: 모든 요청에 Authorization 헤더 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      (config as any).__startedAt = Date.now();
      console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 개발용 로깅 인터셉터: API 호출 결과를 logcat(ReactNativeJS 태그)에서 확인 가능
if (__DEV__) {
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as any;
      const duration = config.__startedAt ? Date.now() - config.__startedAt : '?';
      console.log(
        `[API] ← ${response.status} ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url} (${duration}ms)`,
      );
      return response;
    },
    (error) => {
      const config = error.config as any;
      const duration = config?.__startedAt ? Date.now() - config.__startedAt : '?';
      console.log(
        `[API] ✗ ${error.response?.status ?? 'ERR'} ${config?.method?.toUpperCase()} ${config?.baseURL ?? ''}${config?.url} (${duration}ms) - ${error.message}`,
      );
      return Promise.reject(error);
    },
  );
}

// 응답 인터셉터: 401 발생 시 토큰 재발급 및 원래 요청 재시도
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 이미 재발급 중이면 큐에 넣고 대기
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    try {
      // 재발급 요청: Authorization 헤더 없이 refreshToken만 body로 전달
      const response = await axios.post(`${BACKEND_DOMAIN}/api/v1/users/reissue`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(accessToken, newRefreshToken);

      flushQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      clearTokens();
      resetToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

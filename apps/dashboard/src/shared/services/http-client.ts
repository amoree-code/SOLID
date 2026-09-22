import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { refreshSession } from '@/shared/auth/refresh-session';
import { sessionStorage } from '@/shared/auth/session-storage';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getAccessToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string> | null = null;

function refreshOnce(): Promise<string> {
  refreshPromise ??= refreshSession()
    .then((tokens) => {
      sessionStorage.setAccessToken(tokens.accessToken);
      return tokens.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !config || config._retried) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      const accessToken = await refreshOnce();
      config.headers.set('Authorization', `Bearer ${accessToken}`);
      return httpClient(config);
    } catch (refreshError) {
      sessionStorage.clear();
      window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  },
);

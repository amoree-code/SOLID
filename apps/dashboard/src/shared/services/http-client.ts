import axios from 'axios';
import { appConfig } from '@/app/config/app-config';

/**
 * The one HTTP client every page service uses. It knows the base URL and
 * nothing about any particular backend — add auth headers, tracing or retries
 * here with interceptors when a real project needs them.
 */
export const httpClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { Accept: 'application/json' },
});

/** A setup mistake, not a server failure — its message is safe and useful to show. */
export class ApiConfigError extends Error {
  override name = 'ApiConfigError';
}

// Without a base URL, requests would silently go to the dashboard's own origin.
httpClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    throw new ApiConfigError('VITE_API_BASE_URL is not set — add it to .env to call an API.');
  }
  return config;
});

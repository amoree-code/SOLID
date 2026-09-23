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

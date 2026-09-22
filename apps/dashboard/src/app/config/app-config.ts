import { env } from './env';

export const appConfig = {
  name: env.VITE_APP_NAME,
  apiBaseUrl: env.VITE_API_BASE_URL,
} as const;

import axios from 'axios';
import type { AuthTokens } from './auth.types';

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export async function refreshSession(): Promise<AuthTokens> {
  const response = await refreshClient.post<AuthTokens>('/auth/refresh');
  return response.data;
}

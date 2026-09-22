import axios from 'axios';
import { type AuthTokens, authTokensSchema } from './auth.schema';

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export async function refreshSession(): Promise<AuthTokens> {
  const response = await refreshClient.post<unknown>('/auth/refresh');
  return authTokensSchema.parse(response.data);
}

import type { AuthTokens } from '@/shared/auth/auth.types';
import { httpClient } from '@/shared/services/http-client';
import type { LoginFormValues } from '../schemas/login-form.schema';

export async function login(input: LoginFormValues): Promise<AuthTokens> {
  const response = await httpClient.post<AuthTokens>('/auth/login', input);
  return response.data;
}

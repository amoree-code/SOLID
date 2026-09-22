import { type AuthTokens, authTokensSchema } from '@/shared/auth/auth.schema';
import { httpClient } from '@/shared/services/http-client';
import type { LoginFormValues } from '../schemas/login-form.schema';

export async function login(input: LoginFormValues): Promise<AuthTokens> {
  const response = await httpClient.post<unknown>('/auth/login', input);
  return authTokensSchema.parse(response.data);
}

import { type AuthTokens, authTokensSchema } from '@/shared/auth/auth.schema';
import { httpClient } from '@/shared/services/http-client';
import type { SignupFormValues } from '../schemas/signup-form.schema';

export async function signup(input: SignupFormValues): Promise<AuthTokens> {
  const response = await httpClient.post<unknown>('/auth/register', input);
  return authTokensSchema.parse(response.data);
}

import { httpClient } from './http-client';

export async function checkHealth(): Promise<boolean> {
  const response = await httpClient.get('/health');
  return response.status === 200;
}

import { httpClient } from '@/shared/services/http-client';

export async function deleteItem(id: string): Promise<void> {
  await httpClient.delete(`/example-resources/${id}`);
}

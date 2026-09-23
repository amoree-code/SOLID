import { httpClient } from '@/shared/services/http-client';
import { itemSchema } from '../schemas/item.schema';
import type { Item } from '../types';

export async function getItem(id: string): Promise<Item> {
  const response = await httpClient.get<unknown>(`/example-resources/${id}`);
  return itemSchema.parse(response.data);
}

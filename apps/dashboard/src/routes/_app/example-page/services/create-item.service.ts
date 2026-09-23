import { httpClient } from '@/shared/services/http-client';
import { itemSchema } from '../schemas/item.schema';
import type { CreateItemInput, Item } from '../types';

export async function createItem(input: CreateItemInput): Promise<Item> {
  const response = await httpClient.post<unknown>('/items', input);
  return itemSchema.parse(response.data);
}

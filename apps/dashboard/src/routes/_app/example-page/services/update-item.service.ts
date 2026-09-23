import { httpClient } from '@/shared/services/http-client';
import { itemSchema } from '../schemas/item.schema';
import type { Item, UpdateItemInput } from '../types';

export async function updateItem(input: UpdateItemInput): Promise<Item> {
  const response = await httpClient.patch<unknown>(`/items/${input.id}`, input);
  return itemSchema.parse(response.data);
}

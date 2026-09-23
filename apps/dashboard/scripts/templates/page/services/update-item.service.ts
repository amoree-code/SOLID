import { httpClient } from '@/shared/services/http-client';
import { itemSchema } from '../schemas/item.schema';
import type { Item, UpdateItemInput } from '../types';

export async function updateItem({ id, ...changes }: UpdateItemInput): Promise<Item> {
  const response = await httpClient.patch<unknown>(`/example-resources/${id}`, changes);
  return itemSchema.parse(response.data);
}

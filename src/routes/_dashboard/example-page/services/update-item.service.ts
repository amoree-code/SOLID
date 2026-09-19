import { httpClient } from '@/shared/services/http-client';
import type { Item, UpdateItemInput } from '../types';

export async function updateItem(input: UpdateItemInput): Promise<Item> {
  const response = await httpClient.patch<Item>(`/items/${input.id}`, input);
  return response.data;
}

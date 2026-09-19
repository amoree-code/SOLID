import { httpClient } from '@/shared/services/http-client';
import type { CreateItemInput, Item } from '../types';

export async function createItem(input: CreateItemInput): Promise<Item> {
  const response = await httpClient.post<Item>('/items', input);
  return response.data;
}

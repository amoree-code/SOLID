import { httpClient } from '@/shared/services/http-client';
import type { Item } from '../types';

export async function getItem(id: string): Promise<Item> {
  const response = await httpClient.get<Item>(`/items/${id}`);
  return response.data;
}

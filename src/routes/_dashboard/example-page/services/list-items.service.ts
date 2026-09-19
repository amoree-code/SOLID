import { httpClient } from '@/shared/services/http-client';
import type { ItemSearch } from '../schemas/item-search.schema';
import type { ItemListResponse } from '../types';

export async function listItems(search: ItemSearch): Promise<ItemListResponse> {
  const response = await httpClient.get<ItemListResponse>('/items', { params: search });
  return response.data;
}

import { httpClient } from '@/shared/services/http-client';
import { normalizePaginatedResponse } from '@/shared/services/response-envelope';
import { itemSchema } from '../schemas/item.schema';
import type { ItemSearch } from '../schemas/item-search.schema';
import type { ItemListResponse } from '../types';

export async function listItems(search: ItemSearch): Promise<ItemListResponse> {
  const response = await httpClient.get<unknown>('/example-resources', { params: search });
  return normalizePaginatedResponse(response.data, itemSchema, {
    page: search.page,
    pageSize: search.pageSize,
  });
}

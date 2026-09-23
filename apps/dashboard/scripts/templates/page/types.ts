import type { PaginatedResponse } from '@/shared/services/response-envelope';
import type { Item } from './schemas/item.schema';

export type { Item };

export type ItemListResponse = PaginatedResponse<Item>;

export type CreateItemInput = {
  name: string;
  status: Item['status'];
};

export type UpdateItemInput = {
  id: string;
  name: string;
  status: Item['status'];
};

import type { PaginatedResponse } from '@/shared/query/query.types';

export type Item = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
};

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

import type { ExampleResource } from '../schemas/example-resource.schema.js';

/** The list envelope every paginated endpoint in this API returns. */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ExampleResourceListResponse = PaginatedResponse<ExampleResource>;

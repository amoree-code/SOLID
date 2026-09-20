import { describe, expect, it } from 'vitest';
import { itemKeys } from '@/routes/_dashboard/example-page/queries/item.keys';
import type { ItemSearch } from '@/routes/_dashboard/example-page/schemas/item-search.schema';

const search: ItemSearch = {
  page: 1,
  pageSize: 25,
  search: '',
  status: 'all',
  sort: 'createdAt',
  order: 'desc',
};

describe('itemKeys', () => {
  it('nests list keys under the lists key', () => {
    expect(itemKeys.list(search)).toEqual([...itemKeys.lists(), search]);
  });

  it('nests detail keys under the details key', () => {
    expect(itemKeys.detail('42')).toEqual([...itemKeys.details(), '42']);
  });
});

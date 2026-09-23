import { describe, expect, it } from 'vitest';
import { defaultItemSearch, itemSearchSchema } from '../schemas/item-search.schema';

describe('itemSearchSchema', () => {
  it('fills every key with its default for an empty query string', () => {
    expect(itemSearchSchema.parse({})).toEqual(defaultItemSearch);
  });

  it('coerces and keeps valid values from the URL', () => {
    expect(
      itemSearchSchema.parse({
        page: '2',
        pageSize: '50',
        status: 'active',
        search: '  amer  ',
        sort: 'name',
        order: 'asc',
      }),
    ).toEqual({
      page: 2,
      pageSize: 50,
      status: 'active',
      search: 'amer',
      sort: 'name',
      order: 'asc',
    });
  });

  it('falls back per key for malformed values instead of rejecting the whole URL', () => {
    expect(
      itemSearchSchema.parse({
        page: '-3',
        pageSize: '7',
        status: 'deleted',
        sort: 'password',
        order: 'sideways',
        search: 'ok',
      }),
    ).toEqual({ ...defaultItemSearch, search: 'ok' });
  });

  it('rejects non-numeric pages by falling back to page 1', () => {
    expect(itemSearchSchema.parse({ page: 'abc' }).page).toBe(1);
  });
});

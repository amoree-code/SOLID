import { describe, expect, it } from 'vitest';
import { nextSort } from '../components/item-columns';

describe('nextSort', () => {
  it('flips the order when the sorted column is clicked again', () => {
    expect(nextSort({ sort: 'name', order: 'asc' }, 'name')).toEqual({
      sort: 'name',
      order: 'desc',
    });
    expect(nextSort({ sort: 'name', order: 'desc' }, 'name')).toEqual({
      sort: 'name',
      order: 'asc',
    });
  });

  it('sorts a newly clicked column ascending', () => {
    expect(nextSort({ sort: 'createdAt', order: 'desc' }, 'name')).toEqual({
      sort: 'name',
      order: 'asc',
    });
  });
});

import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { normalizePaginatedResponse } from '../response-envelope';

const rowSchema = z.object({ id: z.string() });
const fallback = { page: 1, pageSize: 25 };

describe('normalizePaginatedResponse', () => {
  it('normalizes the { items, total, page, pageSize } shape', () => {
    const result = normalizePaginatedResponse(
      { items: [{ id: '1' }], total: 1, page: 2, pageSize: 10 },
      rowSchema,
      fallback,
    );

    expect(result).toEqual({ items: [{ id: '1' }], total: 1, page: 2, pageSize: 10 });
  });

  it('normalizes the { data, meta } shape, falling back for missing paging fields', () => {
    const result = normalizePaginatedResponse(
      { data: [{ id: '1' }], meta: { total: 1 } },
      rowSchema,
      fallback,
    );

    expect(result).toEqual({ items: [{ id: '1' }], total: 1, page: 1, pageSize: 25 });
  });

  it('normalizes the { results, count } shape', () => {
    const result = normalizePaginatedResponse(
      { results: [{ id: '1' }], count: 1 },
      rowSchema,
      fallback,
    );

    expect(result).toEqual({ items: [{ id: '1' }], total: 1, page: 1, pageSize: 25 });
  });

  it('normalizes a raw array, deriving total from its length', () => {
    const result = normalizePaginatedResponse([{ id: '1' }, { id: '2' }], rowSchema, fallback);

    expect(result).toEqual({ items: [{ id: '1' }, { id: '2' }], total: 2, page: 1, pageSize: 25 });
  });

  it('throws when an item does not match the schema', () => {
    expect(() =>
      normalizePaginatedResponse(
        { items: [{ wrong: true }], total: 1, page: 1, pageSize: 25 },
        rowSchema,
        fallback,
      ),
    ).toThrow();
  });

  it('throws when the envelope matches none of the known shapes', () => {
    expect(() => normalizePaginatedResponse({ nonsense: true }, rowSchema, fallback)).toThrow();
  });
});

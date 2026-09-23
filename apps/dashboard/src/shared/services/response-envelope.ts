import { z } from 'zod';

/** The one list shape every page sees, whatever the backend actually sends. */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Backends disagree on how a paginated list is wrapped. Rather than have every
 * page guess and cast, this recognizes the common shapes and normalizes them
 * to one canonical `PaginatedResponse<T>` — the only shape pages ever see.
 */
const paginatedEnvelopeSchema = z.union([
  z.object({
    items: z.array(z.unknown()),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  }),
  z.object({
    data: z.array(z.unknown()),
    meta: z.object({
      total: z.number(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }),
  }),
  z.object({
    results: z.array(z.unknown()),
    count: z.number(),
  }),
  z.array(z.unknown()),
]);

type FallbackPage = { page: number; pageSize: number };

function toRawItems(
  envelope: z.infer<typeof paginatedEnvelopeSchema>,
  fallback: FallbackPage,
): { rawItems: unknown[]; total: number; page: number; pageSize: number } {
  if (Array.isArray(envelope)) {
    return { rawItems: envelope, total: envelope.length, ...fallback };
  }

  if ('items' in envelope) {
    return {
      rawItems: envelope.items,
      total: envelope.total,
      page: envelope.page,
      pageSize: envelope.pageSize,
    };
  }

  if ('data' in envelope) {
    return {
      rawItems: envelope.data,
      total: envelope.meta.total,
      page: envelope.meta.page ?? fallback.page,
      pageSize: envelope.meta.pageSize ?? fallback.pageSize,
    };
  }

  return { rawItems: envelope.results, total: envelope.count, ...fallback };
}

/**
 * Validates the raw HTTP response against the known envelope shapes, then
 * validates each item against `itemSchema` — a real runtime guarantee, not
 * just a compile-time type cast on `httpClient.get<T>()`.
 */
export function normalizePaginatedResponse<T>(
  raw: unknown,
  itemSchema: z.ZodType<T>,
  fallback: FallbackPage,
): PaginatedResponse<T> {
  const envelope = paginatedEnvelopeSchema.parse(raw);
  const { rawItems, total, page, pageSize } = toRawItems(envelope, fallback);

  return {
    items: rawItems.map((item) => itemSchema.parse(item)),
    total,
    page,
    pageSize,
  };
}

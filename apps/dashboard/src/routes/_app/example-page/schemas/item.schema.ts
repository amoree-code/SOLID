import { z } from 'zod';

/**
 * Describes the entity as the backend actually sends it. Every service parses
 * a response through this before it reaches a page — a wrong or renamed field
 * fails loudly here instead of surfacing as `undefined` deep in a component.
 */
export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';

const schema = z.object({ name: z.string().min(2) });

describe('ZodValidationPipe', () => {
  it('returns the parsed value when it matches the schema', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: 'Ameer' })).toEqual({ name: 'Ameer' });
  });

  it('throws a normalized 400 with per-field errors when validation fails', () => {
    const pipe = new ZodValidationPipe(schema);

    try {
      pipe.transform({ name: 'a' });
      expect.unreachable('transform should have thrown');
    } catch (error) {
      const response = (error as { getResponse: () => unknown }).getResponse();
      expect(response).toMatchObject({
        code: 'VALIDATION_ERROR',
        errors: { name: expect.any(Array) },
      });
    }
  });
});

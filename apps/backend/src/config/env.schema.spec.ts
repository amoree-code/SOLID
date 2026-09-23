import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.schema.js';

const base = { DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' };

describe('validateEnv', () => {
  it('applies defaults and disables CORS when no origin is set', () => {
    expect(validateEnv(base)).toEqual({
      ...base,
      PORT: 3000,
      CORS_ORIGIN: [],
      RATE_LIMIT_WINDOW_MS: 60_000,
      RATE_LIMIT_MAX: 100,
    });
  });

  it('splits a comma-separated CORS origin list', () => {
    const env = validateEnv({ ...base, CORS_ORIGIN: 'http://a.test, http://b.test' });
    expect(env.CORS_ORIGIN).toEqual(['http://a.test', 'http://b.test']);
  });

  it('fails fast on a missing DATABASE_URL or a malformed origin', () => {
    expect(() => validateEnv({})).toThrow();
    expect(() => validateEnv({ ...base, CORS_ORIGIN: 'not-a-url' })).toThrow();
  });
});

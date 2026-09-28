import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.schema.js';

const base = { DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' };

describe('validateEnv', () => {
  it('applies defaults and disables CORS when no origin is set', () => {
    expect(validateEnv(base)).toEqual({
      ...base,
      NODE_ENV: 'development',
      PORT: 3000,
      CORS_ORIGIN: [],
      RATE_LIMIT_WINDOW_MS: 60_000,
      RATE_LIMIT_MAX: 100,
      SWAGGER_ENABLED: true,
      TRUST_PROXY: 0,
    });
  });

  it('splits a comma-separated CORS origin list', () => {
    const env = validateEnv({ ...base, CORS_ORIGIN: 'http://a.test, http://b.test' });
    expect(env.CORS_ORIGIN).toEqual(['http://a.test', 'http://b.test']);
  });

  it('parses a false Swagger flag as false', () => {
    expect(validateEnv({ ...base, SWAGGER_ENABLED: 'false' }).SWAGGER_ENABLED).toBe(false);
  });

  it('fails fast on a missing DATABASE_URL or a malformed origin', () => {
    expect(() => validateEnv({})).toThrow();
    expect(() => validateEnv({ ...base, CORS_ORIGIN: 'not-a-url' })).toThrow();
    expect(() => validateEnv({ ...base, DATABASE_URL: 'https://example.test/db' })).toThrow();
  });
});

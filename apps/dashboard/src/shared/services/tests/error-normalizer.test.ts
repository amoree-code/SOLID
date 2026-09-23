import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { normalizeError } from '../error-normalizer';

function httpError(status: number, data: unknown): AxiosError {
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse;
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response);
}

describe('normalizeError', () => {
  it('reads { message, code, errors }', () => {
    const error = httpError(400, {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: { name: ['Required'] },
    });

    expect(normalizeError(error)).toEqual({
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      fieldErrors: { name: ['Required'] },
    });
  });

  it('joins an array message', () => {
    const error = httpError(400, { message: ['name is required', 'status is invalid'] });

    expect(normalizeError(error).message).toBe('name is required, status is invalid');
  });

  it('falls back to a generic message for an unrecognized body, keeping the status', () => {
    const result = normalizeError(httpError(502, '<html>Bad gateway</html>'));

    expect(result.message).toBe('Something went wrong. Please try again.');
    expect(result.status).toBe(502);
  });

  it('reports a network failure when there is no response', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');

    expect(normalizeError(error)).toMatchObject({ status: null, code: 'ERR_NETWORK' });
    expect(normalizeError(error).message).toMatch(/could not reach the server/i);
  });

  it('never leaks a raw non-HTTP error message to the UI', () => {
    expect(normalizeError(new TypeError('x is undefined')).message).toBe(
      'Something went wrong. Please try again.',
    );
  });
});

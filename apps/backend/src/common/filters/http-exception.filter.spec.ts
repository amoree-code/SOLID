import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('passes an already-shaped error body through unchanged', () => {
    const exception = new BadRequestException({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: { name: ['Required'] },
    });

    expect(filter.normalize(exception)).toEqual({
      status: 400,
      body: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: { name: ['Required'] },
      },
    });
  });

  it("normalizes Nest's default shape, joining array messages", () => {
    const exception = new BadRequestException(['name is required', 'status is invalid']);

    expect(filter.normalize(exception)).toEqual({
      status: 400,
      body: { message: 'name is required, status is invalid', code: null, errors: null },
    });
  });

  it('keeps the status of a plain HttpException', () => {
    expect(filter.normalize(new NotFoundException()).status).toBe(404);
  });

  it('hides unexpected errors behind a generic 500 and logs them instead', () => {
    const log = vi.spyOn(filter.logger, 'error').mockImplementation(() => {});

    const result = filter.normalize(new Error('connection string leaked here'));

    expect(result).toEqual({
      status: 500,
      body: {
        message: 'Something went wrong. Please try again.',
        code: 'INTERNAL_ERROR',
        errors: null,
      },
    });
    expect(log).toHaveBeenCalled();
  });
});

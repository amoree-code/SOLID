import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorBody = {
  message: string;
  code: string | null;
  errors: Record<string, string[]> | null;
};

/**
 * Normalizes every thrown error into the one shape the dashboard template's
 * `error-normalizer.ts` already expects: `{ message, code, errors }`. Without
 * this, Nest's default shape (`{ statusCode, message, error }`) only happens
 * to line up for some exceptions and not others, depending on what threw.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, body } = this.normalize(exception);
    response.status(status).json(body);
  }

  private normalize(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'object' && payload !== null && 'code' in payload) {
        // Already shaped by ZodValidationPipe or similar — pass through.
        return { status, body: payload as ErrorBody };
      }

      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ?? exception.message);

      return {
        status,
        body: {
          message: Array.isArray(message) ? message.join(', ') : message,
          code: null,
          errors: null,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { message: 'Something went wrong. Please try again.', code: null, errors: null },
    };
  }
}

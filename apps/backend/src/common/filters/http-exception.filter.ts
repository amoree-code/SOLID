import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

export type ErrorBody = {
  message: string;
  code: string | null;
  errors: Record<string, string[]> | null;
};

function isErrorBody(payload: unknown): payload is ErrorBody {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    'code' in payload
  );
}

/**
 * Every error this API returns has one shape: `{ message, code, errors }`.
 * Nest's default (`{ statusCode, message, error }`) varies with whatever threw;
 * this makes it the same for every exception, and never leaks an unexpected
 * error's internals to the client — those are logged instead.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.normalize(exception);
    response.status(status).json(body);
  }

  normalize(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (isErrorBody(payload)) {
        // Already shaped (ZodValidationPipe, or a service's own exception).
        return {
          status,
          body: { message: payload.message, code: payload.code, errors: payload.errors ?? null },
        };
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

    this.logger.error(
      exception instanceof Error ? (exception.stack ?? exception.message) : exception,
    );

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        message: 'Something went wrong. Please try again.',
        code: 'INTERNAL_ERROR',
        errors: null,
      },
    };
  }
}

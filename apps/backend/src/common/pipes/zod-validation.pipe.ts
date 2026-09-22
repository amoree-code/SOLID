import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * The one place raw request input (body/query/params) gets validated before
 * a controller ever sees it — mirrors how every dashboard service parses a
 * response through a Zod schema before a page sees it. A field the client
 * got wrong fails here, as a normalized 400, not deep inside a service.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_root';
        fieldErrors[path] ??= [];
        fieldErrors[path].push(issue.message);
      }

      throw new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: fieldErrors,
      });
    }

    return result.data;
  }
}

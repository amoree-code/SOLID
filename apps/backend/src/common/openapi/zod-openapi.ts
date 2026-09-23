import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, type ApiResponseSchemaHost } from '@nestjs/swagger';
import type { ZodObject, ZodRawShape, ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// The package root doesn't export SchemaObject; take it from a public option type.
type SchemaObject = ApiResponseSchemaHost['schema'];

/**
 * Swagger reads the same Zod schemas that validate requests, so `/docs` can
 * never drift from what the API actually accepts and returns.
 */
export function toOpenApiSchema(schema: ZodType): SchemaObject {
  const { $schema: _ignored, ...jsonSchema } = zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  }) as SchemaObject & { $schema?: string };
  return jsonSchema;
}

/** Documents a request body. */
export function ApiZodBody(schema: ZodType): MethodDecorator {
  return ApiBody({ schema: toOpenApiSchema(schema) });
}

/** Documents every key of a query-string schema as an optional query parameter. */
export function ApiZodQuery<T extends ZodRawShape>(schema: ZodObject<T>): MethodDecorator {
  const properties = toOpenApiSchema(schema).properties ?? {};
  return applyDecorators(
    ...Object.entries(properties).map(([name, property]) =>
      ApiQuery({ name, required: false, schema: property as SchemaObject }),
    ),
  );
}

/** Documents a successful response body. */
export function ApiZodResponse(status: number, schema: ZodType): MethodDecorator {
  return ApiResponse({ status, schema: toOpenApiSchema(schema) });
}

/** The one error shape every endpoint returns (see HttpExceptionFilter). */
const errorBodySchema: SchemaObject = {
  type: 'object',
  required: ['message', 'code', 'errors'],
  properties: {
    message: { type: 'string' },
    code: { type: 'string', nullable: true },
    errors: {
      type: 'object',
      nullable: true,
      additionalProperties: { type: 'array', items: { type: 'string' } },
    },
  },
};

export function ApiErrorResponse(status: number, description: string): MethodDecorator {
  return ApiResponse({ status, description, schema: errorBodySchema });
}

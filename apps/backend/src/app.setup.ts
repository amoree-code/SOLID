import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

type AppOptions = {
  corsOrigins: string[];
  swaggerEnabled?: boolean;
  trustProxy?: number;
};

/**
 * Everything that shapes HTTP behavior, applied in one place so `main.ts` and
 * the HTTP tests run exactly the same setup.
 */
export function configureApp(
  app: INestApplication,
  { corsOrigins, swaggerEnabled = true, trustProxy = 0 }: AppOptions,
): void {
  // Security headers (CSP, HSTS, no-sniff, frame protection, …).
  app.use(helmet());

  // Preserve the real client IP for throttling behind a known proxy.
  // Zero means direct exposure; never trust forwarded headers by default.
  app
    .getHttpAdapter()
    .getInstance()
    .set('trust proxy', trustProxy || false);

  if (corsOrigins.length > 0) {
    app.enableCors({ origin: corsOrigins });
  }

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  if (swaggerEnabled) {
    SwaggerModule.setup('docs', app, createOpenApiDocument(app));
  }
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('NestJS API template.')
    .setVersion('0.0.1')
    .build();
  return SwaggerModule.createDocument(app, config);
}

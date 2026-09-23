import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

type AppOptions = {
  corsOrigins: string[];
};

/**
 * Everything that shapes HTTP behavior, applied in one place so `main.ts` and
 * the HTTP tests run exactly the same setup.
 */
export function configureApp(app: INestApplication, { corsOrigins }: AppOptions): void {
  // Security headers (CSP, HSTS, no-sniff, frame protection, …).
  app.use(helmet());

  if (corsOrigins.length > 0) {
    app.enableCors({ origin: corsOrigins });
  }

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  SwaggerModule.setup('docs', app, createOpenApiDocument(app));
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('NestJS API template.')
    .setVersion('0.0.1')
    .build();
  return SwaggerModule.createDocument(app, config);
}

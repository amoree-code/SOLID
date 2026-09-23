import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { Env } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  configureApp(app, { corsOrigins: config.get('CORS_ORIGIN', { infer: true }) });

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  console.log(`API on http://localhost:${port} — docs at http://localhost:${port}/docs`);
}

await bootstrap();

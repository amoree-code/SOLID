import type { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configureApp, createOpenApiDocument } from './app.setup.js';
import { PrismaService } from './database/prisma.service.js';
import { HealthController } from './health/health.controller.js';
import { ExampleResourceController } from './modules/example-resource/example-resource.controller.js';
import { ExampleResourceRepository } from './modules/example-resource/example-resource.repository.js';
import { ExampleResourceService } from './modules/example-resource/example-resource.service.js';

const RATE_LIMIT = 3;

const emptyRepository = {
  findMany: async () => ({ rows: [], total: 0 }),
  findById: async () => null,
};

describe('configureApp (real HTTP setup, no database)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: RATE_LIMIT }])],
      controllers: [ExampleResourceController, HealthController],
      providers: [
        ExampleResourceService,
        { provide: ExampleResourceRepository, useValue: emptyRepository },
        { provide: PrismaService, useValue: { $queryRaw: async () => [] } },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app, { corsOrigins: ['http://localhost:5173'] });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('sends security headers', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('allows only the configured CORS origins', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    const other = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'http://evil.test');

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(other.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rate-limits API routes with 429 in the normal error shape', async () => {
    const server = app.getHttpServer();
    for (let attempt = 0; attempt < RATE_LIMIT; attempt += 1) {
      await request(server).get('/example-resources').expect(200);
    }

    const limited = await request(server).get('/example-resources').expect(429);
    expect(limited.body).toMatchObject({ message: expect.any(String), code: null, errors: null });
  });

  it('never rate-limits the health probes', async () => {
    const server = app.getHttpServer();
    for (let attempt = 0; attempt < RATE_LIMIT + 2; attempt += 1) {
      await request(server).get('/health').expect(200);
    }
  });

  it('serves Swagger docs whose schemas come from the Zod validators', async () => {
    await request(app.getHttpServer()).get('/docs').expect(200);

    const document = createOpenApiDocument(app);
    const create = document.paths['/example-resources']?.post;
    const body = create?.requestBody as {
      content: Record<string, { schema: { properties: Record<string, unknown> } }>;
    };
    expect(Object.keys(body.content['application/json']?.schema.properties ?? {})).toEqual([
      'name',
      'status',
    ]);

    const listParameters = (document.paths['/example-resources']?.get?.parameters ?? []).map(
      (parameter) => ('name' in parameter ? parameter.name : null),
    );
    expect(listParameters).toEqual(
      expect.arrayContaining(['page', 'pageSize', 'search', 'status', 'sort', 'order']),
    );
  });
});

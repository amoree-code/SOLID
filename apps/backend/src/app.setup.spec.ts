import { Body, Controller, type INestApplication, Post } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { configureApp, createOpenApiDocument } from './app.setup.js';
import { ApiZodBody, ApiZodResponse } from './common/openapi/zod-openapi.js';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe.js';
import { PrismaService } from './database/prisma.service.js';
import { HealthController } from './health/health.controller.js';

const RATE_LIMIT = 3;

const noteSchema = z.object({ title: z.string().min(1), done: z.boolean() });

/** A stand-in for a real module: exercises validation, docs and rate limiting. */
@Controller('notes')
class NotesController {
  @Post()
  @ApiZodBody(noteSchema)
  @ApiZodResponse(201, noteSchema)
  create(@Body(new ZodValidationPipe(noteSchema)) body: z.infer<typeof noteSchema>) {
    return body;
  }
}

describe('configureApp (real HTTP setup, no database)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: RATE_LIMIT }])],
      controllers: [NotesController, HealthController],
      providers: [
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

  it('validates bodies into the normal error shape', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: '' })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(response.body.errors)).toEqual(expect.arrayContaining(['title', 'done']));
  });

  it('rate-limits routes with 429 in the normal error shape', async () => {
    const server = app.getHttpServer();
    for (let attempt = 0; attempt < RATE_LIMIT; attempt += 1) {
      await request(server).post('/notes').send({ title: 'a', done: false }).expect(201);
    }

    const limited = await request(server).post('/notes').send({ title: 'a', done: false });
    expect(limited.status).toBe(429);
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
    const body = document.paths['/notes']?.post?.requestBody as {
      content: Record<
        string,
        { schema: { properties: Record<string, unknown>; required: string[] } }
      >;
    };
    const schema = body.content['application/json']?.schema;
    expect(Object.keys(schema?.properties ?? {})).toEqual(['title', 'done']);
    expect(schema?.required).toEqual(['title', 'done']);
  });
});

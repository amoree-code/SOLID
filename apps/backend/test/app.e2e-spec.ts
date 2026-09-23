import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

// Runs the full AppModule against the real database in DATABASE_URL (migrated first — see CI).
describe('App (e2e, real database)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, { corsOrigins: [] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health reports liveness', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /health/ready confirms the database answers', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('serves the API docs', () => {
    return request(app.getHttpServer()).get('/docs-json').expect(200);
  });

  it('answers unknown routes with 404 in the normal error shape', async () => {
    const response = await request(app.getHttpServer()).get('/does-not-exist').expect(404);
    expect(response.body).toMatchObject({ message: expect.any(String), code: null, errors: null });
  });
});

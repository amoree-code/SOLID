import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';

// Runs against the real database in DATABASE_URL (migrated first — see CI).
describe('App (e2e, real database)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
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

  it('creates, reads, updates, lists and deletes an example resource', async () => {
    const server = app.getHttpServer();
    const name = `e2e ${Date.now()}`;

    const created = await request(server)
      .post('/example-resources')
      .send({ name, status: 'active' })
      .expect(201);
    const { id } = created.body as { id: string };

    await request(server)
      .get(`/example-resources/${id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ id, name, status: 'active' });
      });

    await request(server)
      .patch(`/example-resources/${id}`)
      .send({ status: 'inactive' })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ id, status: 'inactive' });
      });

    await request(server)
      .get('/example-resources')
      .query({ search: name, status: 'inactive' })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ total: 1, items: [{ id }] });
      });

    await request(server).delete(`/example-resources/${id}`).expect(204);
    await request(server).get(`/example-resources/${id}`).expect(404);
  });
});

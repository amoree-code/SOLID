import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter.js';
import { ExampleResourceController } from './example-resource.controller.js';
import { ExampleResourceRepository } from './example-resource.repository.js';
import { ExampleResourceService } from './example-resource.service.js';
import type { ExampleResource } from './schemas/example-resource.schema.js';
import type {
  CreateExampleResourceInput,
  UpdateExampleResourceInput,
} from './schemas/example-resource-input.schema.js';
import type { ExampleResourceSearch } from './schemas/example-resource-search.schema.js';

/** In-memory stand-in for the Prisma-backed repository: same contract, no database. */
class InMemoryRepository {
  rows: ExampleResource[] = [
    { id: '1', name: 'First', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  ];
  lastSearch: ExampleResourceSearch | null = null;

  async findMany(search: ExampleResourceSearch) {
    this.lastSearch = search;
    return { rows: this.rows, total: this.rows.length };
  }

  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async create(input: CreateExampleResourceInput) {
    const row = { id: String(this.rows.length + 1), createdAt: new Date().toISOString(), ...input };
    this.rows.push(row);
    return row;
  }

  async update(id: string, input: UpdateExampleResourceInput) {
    const row = this.rows.find((candidate) => candidate.id === id);
    return row ? Object.assign(row, input) : null;
  }

  async delete(id: string) {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => row.id !== id);
    return this.rows.length < before;
  }
}

describe('ExampleResourceController (HTTP)', () => {
  let app: INestApplication;
  let repository: InMemoryRepository;

  beforeEach(async () => {
    repository = new InMemoryRepository();
    const moduleRef = await Test.createTestingModule({
      controllers: [ExampleResourceController],
      providers: [
        ExampleResourceService,
        { provide: ExampleResourceRepository, useValue: repository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / validates the query string, applying defaults and fallbacks', async () => {
    const response = await request(app.getHttpServer())
      .get('/example-resources?page=2&status=nonsense&sort=name')
      .expect(200);

    expect(repository.lastSearch).toEqual({
      page: 2,
      pageSize: 25,
      search: '',
      status: 'all',
      sort: 'name',
      order: 'desc',
    });
    expect(response.body).toMatchObject({ total: 1, page: 2, pageSize: 25 });
  });

  it('GET /:id returns 404 in the normalized error shape', async () => {
    const response = await request(app.getHttpServer()).get('/example-resources/999').expect(404);

    expect(response.body).toEqual({
      message: 'Example resource not found.',
      code: 'NOT_FOUND',
      errors: null,
    });
  });

  it('POST / rejects an invalid body with per-field errors', async () => {
    const response = await request(app.getHttpServer())
      .post('/example-resources')
      .send({ name: 'a', status: 'archived' })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(response.body.errors)).toEqual(expect.arrayContaining(['name', 'status']));
  });

  it('POST / creates a resource', async () => {
    const response = await request(app.getHttpServer())
      .post('/example-resources')
      .send({ name: 'Second', status: 'inactive' })
      .expect(201);

    expect(response.body).toMatchObject({ name: 'Second', status: 'inactive' });
  });

  it('PATCH /:id accepts a partial body (the :id param is not run through the body schema)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/example-resources/1')
      .send({ status: 'inactive' })
      .expect(200);

    expect(response.body).toMatchObject({ id: '1', name: 'First', status: 'inactive' });
  });

  it('PATCH /:id rejects an empty body', async () => {
    await request(app.getHttpServer()).patch('/example-resources/1').send({}).expect(400);
  });

  it('DELETE /:id returns 204, then 404 once it is gone', async () => {
    await request(app.getHttpServer()).delete('/example-resources/1').expect(204);
    await request(app.getHttpServer()).delete('/example-resources/1').expect(404);
  });
});

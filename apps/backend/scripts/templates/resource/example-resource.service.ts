import { Injectable, NotFoundException } from '@nestjs/common';
import { ExampleResourceRepository } from './example-resource.repository.js';
import type { ExampleResource } from './schemas/example-resource.schema.js';
import type {
  CreateExampleResourceInput,
  UpdateExampleResourceInput,
} from './schemas/example-resource-input.schema.js';
import type { ExampleResourceSearch } from './schemas/example-resource-search.schema.js';
import type { ExampleResourceListResponse } from './types/example-resource.types.js';

function notFound(): NotFoundException {
  return new NotFoundException({
    message: 'Example resource not found.',
    code: 'NOT_FOUND',
    errors: null,
  });
}

@Injectable()
export class ExampleResourceService {
  constructor(private readonly repository: ExampleResourceRepository) {}

  async list(search: ExampleResourceSearch): Promise<ExampleResourceListResponse> {
    const { rows, total } = await this.repository.findMany(search);
    return { items: rows, total, page: search.page, pageSize: search.pageSize };
  }

  async getById(id: string): Promise<ExampleResource> {
    const resource = await this.repository.findById(id);
    if (!resource) {
      throw notFound();
    }
    return resource;
  }

  create(input: CreateExampleResourceInput): Promise<ExampleResource> {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateExampleResourceInput): Promise<ExampleResource> {
    const resource = await this.repository.update(id, input);
    if (!resource) {
      throw notFound();
    }
    return resource;
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) {
      throw notFound();
    }
  }
}

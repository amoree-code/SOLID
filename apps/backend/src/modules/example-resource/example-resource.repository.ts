import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { ExampleResource as ExampleResourceRow } from '../../generated/prisma/client.js';
import type { ExampleResource } from './schemas/example-resource.schema.js';
import type {
  CreateExampleResourceInput,
  UpdateExampleResourceInput,
} from './schemas/example-resource-input.schema.js';
import type { ExampleResourceSearch } from './schemas/example-resource-search.schema.js';

function toExampleResource(row: ExampleResourceRow): ExampleResource {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * The only place that talks to Prisma for this resource, and the only place
 * that maps a database row to the API shape. Returns `null` for "not found" —
 * turning that into an HTTP error is the service's decision, not storage's.
 */
@Injectable()
export class ExampleResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    search: ExampleResourceSearch,
  ): Promise<{ rows: ExampleResource[]; total: number }> {
    const where = {
      ...(search.status !== 'all' ? { status: search.status } : {}),
      ...(search.search ? { name: { contains: search.search, mode: 'insensitive' as const } } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.exampleResource.findMany({
        where,
        // `id` breaks ties so paging is stable when many rows share a sort value.
        orderBy: [{ [search.sort]: search.order }, { id: 'asc' }],
        skip: (search.page - 1) * search.pageSize,
        take: search.pageSize,
      }),
      this.prisma.exampleResource.count({ where }),
    ]);

    return { rows: rows.map(toExampleResource), total };
  }

  async findById(id: string): Promise<ExampleResource | null> {
    const row = await this.prisma.exampleResource.findUnique({ where: { id } });
    return row ? toExampleResource(row) : null;
  }

  async create(input: CreateExampleResourceInput): Promise<ExampleResource> {
    return toExampleResource(await this.prisma.exampleResource.create({ data: input }));
  }

  /** Returns `null` when no row has this id. */
  async update(id: string, input: UpdateExampleResourceInput): Promise<ExampleResource | null> {
    const { count } = await this.prisma.exampleResource.updateMany({ where: { id }, data: input });
    return count === 0 ? null : this.findById(id);
  }

  /** Returns `false` when no row has this id. */
  async delete(id: string): Promise<boolean> {
    const { count } = await this.prisma.exampleResource.deleteMany({ where: { id } });
    return count > 0;
  }
}

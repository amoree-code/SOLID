import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateItemInput, UpdateItemInput } from './schemas/create-item.schema.js';
import type { Item } from './schemas/item.schema.js';
import type { ItemSearch } from './schemas/item-search.schema.js';

type ItemRow = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
};

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    status: row.status as Item['status'],
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * The only place that talks to Prisma for this resource — the service layer
 * depends on this class's methods, never on `PrismaService` directly. Swap
 * the storage engine later without touching `ItemsService`.
 */
@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(search: ItemSearch): Promise<{ rows: Item[]; total: number }> {
    const where = {
      ...(search.status !== 'all' ? { status: search.status } : {}),
      ...(search.search ? { name: { contains: search.search, mode: 'insensitive' as const } } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        orderBy: { [search.sort]: search.order },
        skip: (search.page - 1) * search.pageSize,
        take: search.pageSize,
      }),
      this.prisma.item.count({ where }),
    ]);

    return { rows: rows.map(toItem), total };
  }

  async findByIdOrThrow(id: string): Promise<Item> {
    const row = await this.prisma.item.findUnique({ where: { id } });

    if (!row) {
      throw new NotFoundException({ message: 'Item not found.', code: 'NOT_FOUND', errors: null });
    }

    return toItem(row);
  }

  async create(input: CreateItemInput): Promise<Item> {
    const row = await this.prisma.item.create({ data: input });
    return toItem(row);
  }

  async update(id: string, input: UpdateItemInput): Promise<Item> {
    await this.findByIdOrThrow(id);
    const row = await this.prisma.item.update({ where: { id }, data: input });
    return toItem(row);
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.item.delete({ where: { id } });
  }
}

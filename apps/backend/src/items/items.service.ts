import { Injectable } from '@nestjs/common';
import { ItemsRepository } from './items.repository.js';
import type { ItemListResponse } from './items.types.js';
import type { CreateItemInput, UpdateItemInput } from './schemas/create-item.schema.js';
import type { Item } from './schemas/item.schema.js';
import type { ItemSearch } from './schemas/item-search.schema.js';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async list(search: ItemSearch): Promise<ItemListResponse> {
    const { rows, total } = await this.itemsRepository.findMany(search);
    return { items: rows, total, page: search.page, pageSize: search.pageSize };
  }

  getById(id: string): Promise<Item> {
    return this.itemsRepository.findByIdOrThrow(id);
  }

  create(input: CreateItemInput): Promise<Item> {
    return this.itemsRepository.create(input);
  }

  update(id: string, input: UpdateItemInput): Promise<Item> {
    return this.itemsRepository.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.itemsRepository.delete(id);
  }
}

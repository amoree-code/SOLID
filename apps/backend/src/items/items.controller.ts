import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ItemsService } from './items.service.js';
import type { ItemListResponse } from './items.types.js';
import {
  type CreateItemInput,
  createItemSchema,
  type UpdateItemInput,
  updateItemSchema,
} from './schemas/create-item.schema.js';
import type { Item } from './schemas/item.schema.js';
import { type ItemSearch, itemSearchSchema } from './schemas/item-search.schema.js';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @RequirePermission('items.read')
  @UsePipes(new ZodValidationPipe(itemSearchSchema))
  list(@Query() search: ItemSearch): Promise<ItemListResponse> {
    return this.itemsService.list(search);
  }

  @Get(':id')
  @RequirePermission('items.read')
  getById(@Param('id') id: string): Promise<Item> {
    return this.itemsService.getById(id);
  }

  @Post()
  @RequirePermission('items.create')
  @UsePipes(new ZodValidationPipe(createItemSchema))
  create(@Body() body: CreateItemInput): Promise<Item> {
    return this.itemsService.create(body);
  }

  @Patch(':id')
  @RequirePermission('items.update')
  @UsePipes(new ZodValidationPipe(updateItemSchema))
  update(@Param('id') id: string, @Body() body: UpdateItemInput): Promise<Item> {
    return this.itemsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('items.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.itemsService.delete(id);
  }
}

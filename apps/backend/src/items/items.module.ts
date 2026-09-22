import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller.js';
import { ItemsRepository } from './items.repository.js';
import { ItemsService } from './items.service.js';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, ItemsRepository],
})
export class ItemsModule {}

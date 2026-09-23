import { Module } from '@nestjs/common';
import { ExampleResourceController } from './example-resource.controller.js';
import { ExampleResourceRepository } from './example-resource.repository.js';
import { ExampleResourceService } from './example-resource.service.js';

@Module({
  controllers: [ExampleResourceController],
  providers: [ExampleResourceService, ExampleResourceRepository],
})
export class ExampleResourceModule {}

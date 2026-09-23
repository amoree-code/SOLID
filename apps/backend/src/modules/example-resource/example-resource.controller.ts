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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { ExampleResourceService } from './example-resource.service.js';
import type { ExampleResource } from './schemas/example-resource.schema.js';
import {
  type CreateExampleResourceInput,
  createExampleResourceSchema,
  type UpdateExampleResourceInput,
  updateExampleResourceSchema,
} from './schemas/example-resource-input.schema.js';
import {
  type ExampleResourceSearch,
  exampleResourceSearchSchema,
} from './schemas/example-resource-search.schema.js';
import type { ExampleResourceListResponse } from './types/example-resource.types.js';

// Pipes are bound per parameter, not per method: a method-level pipe would
// also run against `@Param('id')` and reject it as an invalid body.
@ApiTags('example-resources')
@Controller('example-resources')
export class ExampleResourceController {
  constructor(private readonly service: ExampleResourceService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(exampleResourceSearchSchema)) search: ExampleResourceSearch,
  ): Promise<ExampleResourceListResponse> {
    return this.service.list(search);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<ExampleResource> {
    return this.service.getById(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createExampleResourceSchema)) body: CreateExampleResourceInput,
  ): Promise<ExampleResource> {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExampleResourceSchema)) body: UpdateExampleResourceInput,
  ): Promise<ExampleResource> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}

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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiZodBody,
  ApiZodQuery,
  ApiZodResponse,
} from '../../common/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { ExampleResourceService } from './example-resource.service.js';
import {
  type ExampleResource,
  exampleResourceListSchema,
  exampleResourceSchema,
} from './schemas/example-resource.schema.js';
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
  @ApiOperation({ summary: 'List example resources (paged, filtered, sorted)' })
  @ApiZodQuery(exampleResourceSearchSchema)
  @ApiZodResponse(200, exampleResourceListSchema)
  list(
    @Query(new ZodValidationPipe(exampleResourceSearchSchema)) search: ExampleResourceSearch,
  ): Promise<ExampleResourceListResponse> {
    return this.service.list(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one example resource' })
  @ApiZodResponse(200, exampleResourceSchema)
  @ApiErrorResponse(404, 'Not found')
  getById(@Param('id') id: string): Promise<ExampleResource> {
    return this.service.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an example resource' })
  @ApiZodBody(createExampleResourceSchema)
  @ApiZodResponse(201, exampleResourceSchema)
  @ApiErrorResponse(400, 'Validation failed')
  create(
    @Body(new ZodValidationPipe(createExampleResourceSchema)) body: CreateExampleResourceInput,
  ): Promise<ExampleResource> {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update some fields of an example resource' })
  @ApiZodBody(updateExampleResourceSchema)
  @ApiZodResponse(200, exampleResourceSchema)
  @ApiErrorResponse(400, 'Validation failed')
  @ApiErrorResponse(404, 'Not found')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExampleResourceSchema)) body: UpdateExampleResourceInput,
  ): Promise<ExampleResource> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an example resource' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiErrorResponse(404, 'Not found')
  delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}

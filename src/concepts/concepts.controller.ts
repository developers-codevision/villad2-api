import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConceptsService } from './concepts.service';
import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';

@ApiTags('concepts')
@Controller('concepts')
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new billable concept' })
  @ApiResponse({
    status: 201,
    description: 'The concept has been successfully created.',
    type: Concept,
  })
  create(@Body() createConceptDto: CreateConceptDto): Promise<Concept> {
    return this.conceptsService.create(createConceptDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all billable concepts' })
  @ApiResponse({
    status: 200,
    description: 'Return all concepts.',
    type: [Concept],
  })
  findAll(): Promise<Concept[]> {
    return this.conceptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific concept by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the concept.',
    type: Concept,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Concept> {
    return this.conceptsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a concept' })
  @ApiResponse({
    status: 200,
    description: 'The concept has been successfully updated.',
    type: Concept,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConceptDto: UpdateConceptDto,
  ): Promise<Concept> {
    return this.conceptsService.update(id, updateConceptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a concept by id' })
  @ApiResponse({
    status: 200,
    description: 'The concept has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.conceptsService.remove(id);
  }
}

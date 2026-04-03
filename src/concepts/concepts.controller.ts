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

@ApiTags('Facturación - Conceptos')
@Controller('concepts')
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un concepto facturable' })
  @ApiResponse({
    status: 201,
    description: 'Concepto creado exitosamente.',
    type: Concept,
  })
  create(@Body() createConceptDto: CreateConceptDto): Promise<Concept> {
    return this.conceptsService.create(createConceptDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los conceptos facturables' })
  @ApiResponse({
    status: 200,
    description: 'Lista de conceptos.',
    type: [Concept],
  })
  findAll(): Promise<Concept[]> {
    return this.conceptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener concepto por ID' })
  @ApiResponse({
    status: 200,
    description: 'Concepto encontrado.',
    type: Concept,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Concept> {
    return this.conceptsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un concepto' })
  @ApiResponse({
    status: 200,
    description: 'Concepto actualizado exitosamente.',
    type: Concept,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConceptDto: UpdateConceptDto,
  ): Promise<Concept> {
    return this.conceptsService.update(id, updateConceptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un concepto' })
  @ApiResponse({
    status: 200,
    description: 'Concepto eliminado exitosamente.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.conceptsService.remove(id);
  }
}

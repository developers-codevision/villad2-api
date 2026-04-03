import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';

@ApiTags('Ausencias (Absences)')
@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una ausencia para un trabajador' })
  create(@Body() createAbsenceDto: CreateAbsenceDto) {
    return this.absenceService.create(createAbsenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de ausencias' })
  findAll() {
    return this.absenceService.findAll();
  }

  @Get('staff/:staffId')
  @ApiOperation({
    summary:
      'Obtener las ausencias de un trabajador por su ID con filtros opcionales',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha de inicio (YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha fin (YYYY-MM-DD)',
    type: String,
  })
  findByStaff(
    @Param('staffId') staffId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.absenceService.findByStaff(+staffId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de ausencia por su ID' })
  findOne(@Param('id') id: string) {
    return this.absenceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de ausencia' })
  update(@Param('id') id: string, @Body() updateAbsenceDto: UpdateAbsenceDto) {
    return this.absenceService.update(+id, updateAbsenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de ausencia' })
  remove(@Param('id') id: string) {
    return this.absenceService.remove(+id);
  }
}

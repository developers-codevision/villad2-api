import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VacationService } from './vacation.service';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';

@ApiTags('Vacaciones (Vacations)')
@Controller('vacation')
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar vacaciones para un trabajador' })
  create(@Body() createVacationDto: CreateVacationDto) {
    return this.vacationService.create(createVacationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de vacaciones' })
  findAll() {
    return this.vacationService.findAll();
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Obtener las vacaciones de un trabajador por su ID' })
  findByStaff(@Param('staffId') staffId: string) {
    return this.vacationService.findByStaff(+staffId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de vacaciones por su ID' })
  findOne(@Param('id') id: string) {
    return this.vacationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de vacaciones' })
  update(@Param('id') id: string, @Body() updateVacationDto: UpdateVacationDto) {
    return this.vacationService.update(+id, updateVacationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de vacaciones' })
  remove(@Param('id') id: string) {
    return this.vacationService.remove(+id);
  }
}
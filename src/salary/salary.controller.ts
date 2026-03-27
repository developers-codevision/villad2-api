import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@ApiTags('Salaries')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo salario para un trabajador' })
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los salarios registrados' })
  findAll() {
    return this.salaryService.findAll();
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Obtener los salarios de un trabajador por su ID' })
  findByStaff(@Param('staffId') staffId: string) {
    return this.salaryService.findByStaff(+staffId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un salario por su ID' })
  findOne(@Param('id') id: string) {
    return this.salaryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un salario' })
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    return this.salaryService.update(+id, updateSalaryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un salario' })
  remove(@Param('id') id: string) {
    return this.salaryService.remove(+id);
  }
}

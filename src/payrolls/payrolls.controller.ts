import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PayrollsService } from './payrolls.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('payrolls')
export class PayrollsController {
  constructor(private readonly payrollsService: PayrollsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva nómina' })
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollsService.create(createPayrollDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las nóminas' })

  findAll() {
    return this.payrollsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una nómina por su ID' })
  findOne(@Param('id') id: string) {
    return this.payrollsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una nómina por su ID' })

  update(@Param('id') id: string, @Body() updatePayrollDto: UpdatePayrollDto) {
    return this.payrollsService.update(+id, updatePayrollDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una nómina por su ID' })
  remove(@Param('id') id: string) {
    return this.payrollsService.remove(+id);
  }
}

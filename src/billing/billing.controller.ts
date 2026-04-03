import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { BillingPaymentService } from './services/billing-payment.service';
import { TipReportService } from './services/tip-report.service';
import { InventoryConsumptionService } from './services/inventory-consumption.service';
import { BillingReportService } from './services/billing-report.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { CreateBillingRecordDto } from './dto/create-billing-record.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { DistributeTipDto, DistributeTax10Dto } from './dto/distribute-tip.dto';
import { Billing } from './entities/billing.entity';
import { BillingItem } from './entities/billing-item.entity';
import { BillingRecord } from './entities/billing-record.entity';

@ApiTags('Facturación')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly billingPaymentService: BillingPaymentService,
    private readonly tipReportService: TipReportService,
    private readonly inventoryConsumptionService: InventoryConsumptionService,
    private readonly billingReportService: BillingReportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear hoja de facturación diaria' })
  @ApiResponse({
    status: 201,
    description: 'Hoja de facturación diaria creada exitosamente.',
    type: Billing,
  })
  create(@Body() createBillingDto: CreateBillingDto): Promise<Billing> {
    return this.billingService.create(createBillingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las hojas de facturación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de hojas de facturación diaria.',
    type: [Billing],
  })
  findAll(): Promise<Billing[]> {
    return this.billingService.findAll();
  }

  @Get('template/:date')
  @ApiOperation({ summary: 'Obtener plantilla de facturación en blanco' })
  @ApiResponse({
    status: 200,
    description: 'Plantilla vacía inicializada con todos los conceptos.',
  })
  getTemplate(@Param('date') date: string): Promise<any> {
    return this.billingService.getTemplate(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener hoja de facturación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la hoja de facturación', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Hoja de facturación con sus items y resumen.',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar hoja de facturación' })
  @ApiParam({ name: 'id', description: 'ID de la hoja de facturación', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Hoja de facturación actualizada.',
    type: Billing,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    return this.billingService.update(id, updateBillingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar hoja de facturación' })
  @ApiParam({ name: 'id', description: 'ID de la hoja de facturación', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Hoja de facturación eliminada.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingService.remove(id);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Obtener item de facturación por ID' })
  @ApiParam({ name: 'id', description: 'ID del item de facturación', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Item de facturación con concepto relacionado.',
    type: BillingItem,
  })
  findBillingItem(@Param('id', ParseIntPipe) id: number): Promise<BillingItem> {
    return this.billingService.findBillingItem(id);
  }
}

@ApiTags('Registros de Facturación')
@Controller('billing')
export class BillingRecordController {
  constructor(private readonly billingService: BillingService) {}

  @Post(':id/record')
  @ApiOperation({ summary: 'Crear registro de facturación individual' })
  @ApiParam({ name: 'id', description: 'ID de la hoja de facturación', example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Registro de facturación creado.',
    type: BillingRecord,
  })
  createRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() createRecordDto: CreateBillingRecordDto,
  ): Promise<BillingRecord> {
    return this.billingService.createRecord(id, createRecordDto);
  }

  @Get('records/all')
  @ApiOperation({ summary: 'Obtener todos los registros de facturación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los registros de facturación.',
    type: [BillingRecord],
  })
  findAllRecords(): Promise<BillingRecord[]> {
    return this.billingService.findAllRecords();
  }

  @Get('records/:id')
  @ApiOperation({ summary: 'Obtener registro de facturación por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Registro de facturación encontrado.',
    type: BillingRecord,
  })
  async findRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BillingRecord> {
    return this.billingService.findRecord(id);
  }

  @Get('records/by-billing/:billingId')
  @ApiOperation({ summary: 'Obtener todos los registros de una hoja de facturación' })
  @ApiParam({ name: 'billingId', description: 'ID de la hoja de facturación', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de facturación.',
    type: [BillingRecord],
  })
  async findAllRecordsByBilling(
    @Param('billingId', ParseIntPipe) billingId: number,
  ): Promise<BillingRecord[]> {
    return this.billingService.findAllRecordsByBilling(billingId);
  }

  @Delete('records/:id')
  @ApiOperation({ summary: 'Eliminar registro de facturación' })
  @ApiParam({ name: 'id', description: 'ID del registro', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Registro de facturación eliminado.',
  })
  async removeRecord(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingService.removeRecord(id);
  }

  @Post('records/:id/park')
  @ApiOperation({ summary: 'Parquear registro de facturación (sin pagar)' })
  @ApiParam({ name: 'id', description: 'ID del registro', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Registro parchado exitosamente.',
    type: BillingRecord,
  })
  async parkBilling(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BillingRecord> {
    return this.billingService.parkRecord(id);
  }
}

@ApiTags('Pagos')
@Controller('billing')
export class BillingPaymentController {
  constructor(private readonly billingPaymentService: BillingPaymentService) {}

  @Post('records/:id/pay')
  @ApiOperation({ summary: 'Procesar pagos mixtos para un registro' })
  @ApiParam({ name: 'id', description: 'ID del registro de facturación', example: 1 })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente' })
  async processPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() processPaymentDto: ProcessPaymentDto,
  ): Promise<any> {
    return this.billingPaymentService.processPayments(
      id,
      processPaymentDto.payments,
      processPaymentDto.useAdvanceBalance,
    );
  }
}

@ApiTags('Inventario')
@Controller('billing')
export class BillingInventoryController {
  constructor(private readonly inventoryConsumptionService: InventoryConsumptionService) {}

  @Post(':id/consume')
  @ApiOperation({ summary: 'Ejecutar consumo de inventario pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la hoja de facturación', example: 1 })
  @ApiQuery({ name: 'date', description: 'Fecha (YYYY-MM-DD)', example: '2026-04-03' })
  @ApiResponse({ status: 200, description: 'Inventario consumido exitosamente' })
  async consumeInventory(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ): Promise<any> {
    return this.inventoryConsumptionService.consumeAllPending(id, date);
  }

  @Get(':id/pending-consumption')
  @ApiOperation({ summary: 'Obtener registros con consumo de inventario pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la hoja de facturación', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de registros pendientes' })
  async getPendingConsumption(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    return this.inventoryConsumptionService.getPendingConsumptionRecords(id);
  }

  @Get('reports/inventory')
  @ApiOperation({ summary: 'Reporte de consumo de inventario por período' })
  @ApiQuery({
    name: 'from',
    description: 'Fecha inicial (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'to',
    description: 'Fecha final (YYYY-MM-DD)',
    example: '2026-04-03',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de consumo de inventario.',
  })
  async getInventoryReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.inventoryConsumptionService.getInventoryReport(from, to);
  }
}

@ApiTags('Propinas')
@Controller('billing')
export class BillingTipController {
  constructor(private readonly tipReportService: TipReportService) {}

  @Post('records/:id/distribute-tips')
  @ApiOperation({ summary: 'Distribuir propinas entre trabajadores' })
  @ApiParam({ name: 'id', description: 'ID del registro de facturación', example: 1 })
  @ApiResponse({ status: 200, description: 'Propinas distribuidas exitosamente' })
  async distributeTips(
    @Param('id', ParseIntPipe) id: number,
    @Body() distributeTipDto: DistributeTipDto,
  ): Promise<any> {
    return this.tipReportService.distributeTips(id, distributeTipDto.workers);
  }

  @Post('records/:id/distribute-tax10')
  @ApiOperation({ summary: 'Distribuir impuesto 10% entre trabajadores' })
  @ApiParam({ name: 'id', description: 'ID del registro de facturación', example: 1 })
  @ApiResponse({ status: 200, description: 'Impuesto 10% distribuido exitosamente' })
  async distributeTax10(
    @Param('id', ParseIntPipe) id: number,
    @Body() distributeTax10Dto: DistributeTax10Dto,
  ): Promise<any> {
    return this.tipReportService.distributeTax10(
      id,
      distributeTax10Dto.workers,
    );
  }

  @Get('reports/tips')
  @ApiOperation({ summary: 'Reporte de propinas por período' })
  @ApiQuery({
    name: 'from',
    description: 'Fecha inicial (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'to',
    description: 'Fecha final (YYYY-MM-DD)',
    example: '2026-04-03',
  })
  @ApiResponse({ status: 200, description: 'Reporte de propinas.' })
  async getTipReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.tipReportService.getTipReport(new Date(from), new Date(to));
  }

  @Get('reports/tax10')
  @ApiOperation({ summary: 'Reporte de impuesto 10% por período' })
  @ApiQuery({
    name: 'from',
    description: 'Fecha inicial (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'to',
    description: 'Fecha final (YYYY-MM-DD)',
    example: '2026-04-03',
  })
  @ApiResponse({ status: 200, description: 'Reporte de impuesto 10%.' })
  async getTax10Report(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.tipReportService.getTax10Report(new Date(from), new Date(to));
  }
}

@ApiTags('Reportes')
@Controller('billing')
export class BillingReportController {
  constructor(private readonly billingReportService: BillingReportService) {}

  @Get('reports/daily/:date')
  @ApiOperation({ summary: 'Reporte diario de facturación' })
  @ApiParam({
    name: 'date',
    description: 'Fecha (YYYY-MM-DD)',
    example: '2026-04-03',
  })
  @ApiResponse({ status: 200, description: 'Reporte diario generado.' })
  async getDailyReport(@Param('date') date: string): Promise<any> {
    return this.billingReportService.getDailyReport(date);
  }
}

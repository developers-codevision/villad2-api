import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { BillingPaymentService } from './services/billing-payment.service';
import { TipReportService } from './services/tip-report.service';
import { InventoryConsumptionService } from './services/inventory-consumption.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { CreateBillingRecordDto } from './dto/create-billing-record.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { DistributeTipDto, DistributeTax10Dto, ReportPeriodDto } from './dto/distribute-tip.dto';
import { Billing } from './entities/billing.entity';
import { BillingRecord } from './entities/billing-record.entity';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly billingPaymentService: BillingPaymentService,
    private readonly tipReportService: TipReportService,
    private readonly inventoryConsumptionService: InventoryConsumptionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new daily billing sheet' })
  @ApiResponse({ status: 201, description: 'The daily billing sheet has been successfully created.', type: Billing })
  create(@Body() createBillingDto: CreateBillingDto): Promise<Billing> {
    return this.billingService.create(createBillingDto);
  }

  @Get('template/:date')
  @ApiOperation({ summary: 'Get a blank billing template for a specific date' })
  @ApiResponse({ status: 200, description: 'Return a template initialized with all concepts and 0 quantity' })
  getTemplate(@Param('date') date: string): Promise<any> {
    return this.billingService.getTemplate(date);
  }

  @Get()
  @ApiOperation({ summary: 'Get all daily billing sheets' })
  @ApiResponse({ status: 200, description: 'Return all daily billing sheets.', type: [Billing] })
  findAll(): Promise<Billing[]> {
    return this.billingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific daily billing sheet by id' })
  @ApiResponse({ status: 200, description: 'Return the daily billing sheet with its items and summary.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a daily billing sheet (rates, items)' })
  @ApiResponse({ status: 200, description: 'The daily billing sheet has been successfully updated.', type: Billing })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    return this.billingService.update(id, updateBillingDto);
  }

  @Post(':id/record')
  @ApiOperation({ summary: 'Create a payment record for a billing' })
  @ApiParam({ name: 'id', description: 'Billing ID', example: 1 })
  @ApiResponse({ status: 201, description: 'Payment record created', type: BillingRecord })
  createRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() createRecordDto: CreateBillingRecordDto,
  ): Promise<BillingRecord> {
    return this.billingService.createRecord(id, createRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a daily billing sheet' })
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingService.remove(id);
  }

  // ==================== PAYMENT ENDPOINTS ====================

  @Post(':id/pay')
  @ApiOperation({ summary: 'Process mixed payments for a billing record' })
  @ApiParam({ name: 'id', description: 'Billing Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
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

  @Post(':id/park')
  @ApiOperation({ summary: 'Park a billing (unpaid)' })
  @ApiParam({ name: 'id', description: 'Billing Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Billing parked successfully' })
  async parkBilling(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const record = await this.billingService.findOne(id);
    // Logic to park will be implemented in service
    return;
  }

  // ==================== INVENTORY CONSUMPTION ENDPOINTS ====================

  @Post(':id/consume')
  @ApiOperation({ summary: 'Execute pending inventory consumption' })
  @ApiParam({ name: 'id', description: 'Billing ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Inventory consumed successfully' })
  async consumeInventory(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ): Promise<any> {
    return this.inventoryConsumptionService.consumeAllPending(id, date);
  }

  @Get(':id/pending-consumption')
  @ApiOperation({ summary: 'Get items with pending inventory consumption' })
  @ApiParam({ name: 'id', description: 'Billing ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of pending items' })
  async getPendingConsumption(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.inventoryConsumptionService.getPendingConsumptionItems(id);
  }

  // ==================== TIP & TAX10 ENDPOINTS ====================

  @Post('records/:id/distribute-tips')
  @ApiOperation({ summary: 'Distribute tips among workers' })
  @ApiParam({ name: 'id', description: 'Billing Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Tips distributed successfully' })
  async distributeTips(
    @Param('id', ParseIntPipe) id: number,
    @Body() distributeTipDto: DistributeTipDto,
  ): Promise<any> {
    return this.tipReportService.distributeTips(id, distributeTipDto.workers);
  }

  @Post('records/:id/distribute-tax10')
  @ApiOperation({ summary: 'Distribute 10% tax among workers' })
  @ApiParam({ name: 'id', description: 'Billing Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Tax 10% distributed successfully' })
  async distributeTax10(
    @Param('id', ParseIntPipe) id: number,
    @Body() distributeTax10Dto: DistributeTax10Dto,
  ): Promise<any> {
    return this.tipReportService.distributeTax10(id, distributeTax10Dto.workers);
  }

  @Post('reports/tips')
  @ApiOperation({ summary: 'Get tip report for a period' })
  @ApiResponse({ status: 200, description: 'Tip report generated' })
  async getTipReport(@Body() periodDto: ReportPeriodDto): Promise<any> {
    return this.tipReportService.getTipReport(new Date(periodDto.from), new Date(periodDto.to));
  }

  @Post('reports/tax10')
  @ApiOperation({ summary: 'Get tax 10% report for a period' })
  @ApiResponse({ status: 200, description: 'Tax 10% report generated' })
  async getTax10Report(@Body() periodDto: ReportPeriodDto): Promise<any> {
    return this.tipReportService.getTax10Report(new Date(periodDto.from), new Date(periodDto.to));
  }
}

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
import { BillingRecord } from './entities/billing-record.entity';

@ApiTags('billing')
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
  @ApiOperation({ summary: 'Create a new daily billing sheet' })
  @ApiResponse({
    status: 201,
    description: 'The daily billing sheet has been successfully created.',
    type: Billing,
  })
  create(@Body() createBillingDto: CreateBillingDto): Promise<Billing> {
    return this.billingService.create(createBillingDto);
  }

  @Get('template/:date')
  @ApiOperation({ summary: 'Get a blank billing template for a specific date' })
  @ApiResponse({
    status: 200,
    description:
      'Return a template initialized with all concepts and 0 quantity',
  })
  getTemplate(@Param('date') date: string): Promise<any> {
    return this.billingService.getTemplate(date);
  }

  @Get()
  @ApiOperation({ summary: 'Get all daily billing sheets' })
  @ApiResponse({
    status: 200,
    description: 'Return all daily billing sheets.',
    type: [Billing],
  })
  findAll(): Promise<Billing[]> {
    return this.billingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific daily billing sheet by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the daily billing sheet with its items and summary.',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a daily billing sheet (rates, items)' })
  @ApiResponse({
    status: 200,
    description: 'The daily billing sheet has been successfully updated.',
    type: Billing,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    return this.billingService.update(id, updateBillingDto);
  }

  @Post(':id/record')
  @ApiOperation({ summary: 'Create a payment record for a billing' })
  @ApiParam({ name: 'id', description: 'Billing ID', example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Payment record created',
    type: BillingRecord,
  })
  createRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() createRecordDto: CreateBillingRecordDto,
  ): Promise<BillingRecord> {
    return this.billingService.createRecord(id, createRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a daily billing sheet' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
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
  async parkBilling(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BillingRecord> {
    return this.billingService.parkRecord(id);
  }

  @Get('records/:id')
  @ApiOperation({ summary: 'Get a billing record by ID' })
  @ApiParam({ name: 'id', description: 'Record ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Billing record found',
    type: BillingRecord,
  })
  async findRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BillingRecord> {
    return this.billingService.findRecord(id);
  }

  @Get('records/billing/:billingId')
  @ApiOperation({ summary: 'Get all billing records for a specific billing' })
  @ApiParam({ name: 'billingId', description: 'Billing ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'List of billing records',
    type: [BillingRecord],
  })
  async findAllRecordsByBilling(
    @Param('billingId', ParseIntPipe) billingId: number,
  ): Promise<BillingRecord[]> {
    return this.billingService.findAllRecordsByBilling(billingId);
  }

  @Delete('records/:id')
  @ApiOperation({ summary: 'Delete a billing record' })
  @ApiParam({ name: 'id', description: 'Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Billing record deleted' })
  async removeRecord(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingService.removeRecord(id);
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
  async getPendingConsumption(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
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
    return this.tipReportService.distributeTax10(
      id,
      distributeTax10Dto.workers,
    );
  }

  @Get('reports/daily/:date')
  @ApiOperation({ summary: 'Get daily billing report for a specific date' })
  @ApiParam({
    name: 'date',
    description: 'Date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiResponse({ status: 200, description: 'Daily report generated' })
  async getDailyReport(@Param('date') date: string): Promise<any> {
    return this.billingReportService.getDailyReport(date);
  }

  @Get('reports/inventory')
  @ApiOperation({ summary: 'Get inventory consumption report for a period' })
  @ApiQuery({
    name: 'from',
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'to',
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory consumption report generated',
  })
  async getInventoryReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.billingReportService.getInventoryConsumptionReport(from, to);
  }

  @Get('reports/tips')
  @ApiOperation({ summary: 'Get tip report for a period' })
  @ApiQuery({
    name: 'from',
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'to',
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({ status: 200, description: 'Tip report generated' })
  async getTipReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.tipReportService.getTipReport(new Date(from), new Date(to));
  }

  @Get('reports/tax10')
  @ApiOperation({ summary: 'Get tax 10% report for a period' })
  @ApiQuery({
    name: 'from',
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'to',
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({ status: 200, description: 'Tax 10% report generated' })
  async getTax10Report(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.tipReportService.getTax10Report(new Date(from), new Date(to));
  }
}

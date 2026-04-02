import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BillingRecordService } from '../services/billing-record.service';
import { CreateBillingRecordDto } from '../dto/create-billing-record.dto';
import { BillingRecord } from '../entities/billing-record.entity';

@ApiTags('billing-records')
@Controller('billing-records')
export class BillingRecordController {
  constructor(private readonly billingRecordService: BillingRecordService) {}

  @Post()
  @ApiOperation({ summary: 'Create a billing record (payment transaction)' })
  @ApiResponse({ status: 201, description: 'Billing record created', type: BillingRecord })
  create(@Body() createDto: CreateBillingRecordDto): Promise<BillingRecord> {
    return this.billingRecordService.create(createDto);
  }

  @Get('billing/:billingId')
  @ApiOperation({ summary: 'Get all billing records for a specific billing' })
  @ApiParam({ name: 'billingId', description: 'Billing ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of billing records', type: [BillingRecord] })
  findAllByBilling(@Param('billingId', ParseIntPipe) billingId: number): Promise<BillingRecord[]> {
    return this.billingRecordService.findAllByBilling(billingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a billing record by ID' })
  @ApiParam({ name: 'id', description: 'Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Billing record found', type: BillingRecord })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BillingRecord> {
    return this.billingRecordService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a billing record' })
  @ApiParam({ name: 'id', description: 'Record ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Billing record deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingRecordService.remove(id);
  }
}

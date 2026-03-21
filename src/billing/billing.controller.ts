import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { Billing } from './entities/billing.entity';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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
  @ApiOperation({ summary: 'Update a daily billing sheet' })
  @ApiResponse({ status: 200, description: 'The daily billing sheet has been successfully updated.', type: Billing })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    return this.billingService.update(id, updateBillingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a daily billing sheet' })
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingService.remove(id);
  }
}

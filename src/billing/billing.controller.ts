import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { Billing } from './entities/billing.entity';
import { ExtraBilling } from './entities/extra-billing.entity';
import { CreateExtraBillingDto } from './dto/create-extra-billing.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new accounting billing record' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: Billing })
  create(@Body() createBillingDto: CreateBillingDto): Promise<Billing> {
    return this.billingService.create(createBillingDto);
  }

  @Post('extra')
  @ApiOperation({ summary: 'Create a new extra billing record' })
  @ApiResponse({ status: 201, description: 'The extra billing has been carefully recorded.', type: ExtraBilling })
  createExtraBilling(@Body() createExtraBillingDto: CreateExtraBillingDto): Promise<ExtraBilling> {
    return this.billingService.createExtraBilling(createExtraBillingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounting billing records' })
  @ApiResponse({ status: 200, description: 'Return all billing records.', type: [Billing] })
  findAll(): Promise<Billing[]> {
    return this.billingService.findAll();
  }

  @Get('extra')
  @ApiOperation({ summary: 'Get all extra billing records' })
  @ApiResponse({ status: 200, description: 'Return all extra billing records.', type: [ExtraBilling] })
  findAllExtraBillings(): Promise<ExtraBilling[]> {
    return this.billingService.findAllExtraBillings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific billing record by id' })
  @ApiResponse({ status: 200, description: 'Return the billing record.', type: Billing })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Billing> {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a billing record' })
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: Billing })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    return this.billingService.update(id, updateBillingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a billing record' })
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billingService.remove(id);
  }
}

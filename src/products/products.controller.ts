import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SaveDailyIpvDto } from './dto/save-daily-ipv.dto';
import { Product } from './entities/product.entity';
import { ProductDailyRecord } from './entities/product-daily-record.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Products CRUD ───────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a product (static data only)' })
  @ApiResponse({ status: 201, description: 'Created', type: Product })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (static data)' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [Product],
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one product by id' })
  @ApiParam({ name: 'id', description: 'Product id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (static data)' })
  @ApiParam({ name: 'id', description: 'Product id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product updated', type: Product })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // ─── IPV (Daily Records) ─────────────────────────────────────────────────────

  @Get('ipv/daily')
  @ApiOperation({
    summary: 'Get IPV for a specific date, grouped by product family',
    description:
      'Returns all products with their daily inventory record for the given date. ' +
      'If a product has no record for that date, `initial` is seeded from the ' +
      '`final` of the previous recorded day. Records are NOT created until saveIpv() is called.',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2026-03-19',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'IPV grouped by family' })
  getIpvForDate(@Query('date') date: string) {
    return this.productsService.getIpvForDate(date);
  }

  @Post('ipv/save')
  @ApiOperation({
    summary: 'Save (upsert) the IPV for a specific date',
    description:
      'Saves the daily inventory state for all products on the given date. ' +
      'Existing records are updated; new ones are created. ' +
      'This is the "guardar" button action from the frontend.',
  })
  @ApiResponse({
    status: 201,
    description: 'Saved daily records',
    type: [ProductDailyRecord],
  })
  saveIpv(@Body() saveDto: SaveDailyIpvDto) {
    return this.productsService.saveIpv(saveDto);
  }
}

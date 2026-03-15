import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductFamiliesService } from './product-families.service';
import { CreateProductFamilyDto } from './dto/create-product-family.dto';
import { UpdateProductFamilyDto } from './dto/update-product-family.dto';
import { ProductFamily } from './entities/product-family.entity';

@ApiTags('product-families')
@Controller('product-families')
export class ProductFamiliesController {
  constructor(
    private readonly productFamiliesService: ProductFamiliesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a product family' })
  @ApiResponse({ status: 201, description: 'Created', type: ProductFamily })
  create(@Body() createProductFamilyDto: CreateProductFamilyDto) {
    return this.productFamiliesService.create(createProductFamilyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product families' })
  @ApiResponse({ status: 200, description: 'List of product families', type: [ProductFamily] })
  findAll() {
    return this.productFamiliesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one product family by id' })
  @ApiParam({ name: 'id', description: 'Product family id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product family found', type: ProductFamily })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productFamiliesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product family' })
  @ApiParam({ name: 'id', description: 'Product family id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product family updated', type: ProductFamily })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductFamilyDto: UpdateProductFamilyDto,
  ) {
    return this.productFamiliesService.update(id, updateProductFamilyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product family' })
  @ApiParam({ name: 'id', description: 'Product family id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product family deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productFamiliesService.remove(id);
  }
}

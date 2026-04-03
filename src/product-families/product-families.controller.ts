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

@ApiTags('Inventario - Familias de Productos')
@Controller('product-families')
export class ProductFamiliesController {
  constructor(
    private readonly productFamiliesService: ProductFamiliesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una familia de productos' })
  @ApiResponse({ status: 201, description: 'Familia creada', type: ProductFamily })
  create(@Body() createProductFamilyDto: CreateProductFamilyDto) {
    return this.productFamiliesService.create(createProductFamilyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las familias de productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de familias de productos',
    type: [ProductFamily],
  })
  findAll() {
    return this.productFamiliesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener familia de productos por ID' })
  @ApiParam({ name: 'id', description: 'ID de la familia', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Familia encontrada',
    type: ProductFamily,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productFamiliesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una familia de productos' })
  @ApiParam({ name: 'id', description: 'ID de la familia', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Familia actualizada',
    type: ProductFamily,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductFamilyDto: UpdateProductFamilyDto,
  ) {
    return this.productFamiliesService.update(id, updateProductFamilyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una familia de productos' })
  @ApiParam({ name: 'id', description: 'ID de la familia', example: 1 })
  @ApiResponse({ status: 200, description: 'Familia eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productFamiliesService.remove(id);
  }
}

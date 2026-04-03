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

@ApiTags('Inventario - Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Productos (Datos estáticos) ─────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiResponse({ status: 201, description: 'Producto creado', type: Product })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos',
    type: [Product],
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: Product })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto actualizado', type: Product })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // ─── IPV (Inventario Permanente de Valores) ───────────────────────────────────

  @Get('ipv/daily')
  @ApiOperation({
    summary: 'Obtener IPV para una fecha específica',
    description:
      'Retorna todos los productos con su registro de inventario diario para la fecha dada. ' +
      'Si un producto no tiene registro para esa fecha, `initial` se calcula desde el `final` del día anterior.',
  })
  @ApiQuery({
    name: 'date',
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2026-03-19',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'IPV agrupado por familia de productos' })
  getIpvForDate(@Query('date') date: string) {
    return this.productsService.getIpvForDate(date);
  }

  @Post('ipv/save')
  @ApiOperation({
    summary: 'Guardar IPV para una fecha específica',
    description:
      'Guarda el estado del inventario diario para todos los productos en la fecha dada. ' +
      'Registros existentes se actualizan; nuevos se crean.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registros diarios guardados',
    type: [ProductDailyRecord],
  })
  saveIpv(@Body() saveDto: SaveDailyIpvDto) {
    return this.productsService.saveIpv(saveDto);
  }
}

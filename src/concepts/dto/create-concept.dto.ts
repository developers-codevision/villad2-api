import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConceptProductDto {
  @ApiProperty({ description: 'ID del producto del inventario', example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Cantidad del producto', example: 1 })
  @IsNumber()
  quantity: number;
}

export class CreateConceptDto {
  @ApiProperty({ description: 'Nombre del concepto', example: 'Cerveza' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Categoría del concepto',
    example: 'Bebidas',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Lista de productos que componen el concepto',
    type: [ConceptProductDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptProductDto)
  products?: ConceptProductDto[];

  @ApiPropertyOptional({
    description: 'ID del billing para asociar el concepto (opcional)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  billingId?: number;

  @ApiPropertyOptional({
    description: 'Precio en USD (requerido si se proporciona billingId)',
    example: 2.5,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

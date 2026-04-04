import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConceptProductDto {
  @ApiProperty({
    description: 'ID del producto del inventario',
    example: 1,
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Cantidad del producto a consumir',
    example: 1,
  })
  @IsNumber()
  quantity: number;
}

export class CreateConceptDto {
  @ApiProperty({
    description: 'Nombre del concepto facturable',
    example: 'Cerveza Cristal 350ml',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Categoría a la que pertenece el concepto',
    example: 'Bebidas',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Lista de productos del inventario que componen este concepto',
    type: [ConceptProductDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptProductDto)
  products?: ConceptProductDto[];

  @ApiPropertyOptional({
    description: 'ID de la hoja de facturación para asociar el concepto',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  billingId?: number;

  @ApiPropertyOptional({
    description: 'Precio del concepto en USD',
    example: 2.50,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

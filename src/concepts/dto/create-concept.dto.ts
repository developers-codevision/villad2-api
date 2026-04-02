import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateConceptDto {
  @ApiProperty({ description: 'Nombre del concepto', example: 'Cerveza' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Categoría del concepto', example: 'Bebidas' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'ID del billing para asociar el concepto (opcional)', example: 1 })
  @IsOptional()
  @IsInt()
  billingId?: number;

  @ApiPropertyOptional({ description: 'Precio en USD (requerido si se proporciona billingId)', example: 2.5 })
  @IsOptional()
  @IsNumber()
  price?: number;
}

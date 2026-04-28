import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Código único del producto',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  code: number;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Ron Havana Club 7 Años',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Unidad de medida (ej: pieza, kg, litro, caja)',
    example: 'botella',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitMeasure: string;

  @ApiProperty({
    description: 'Volumen o contenido (ej: 750ml, 1L)',
    example: '750ml',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  volume: string;

  @ApiPropertyOptional({
    description: 'ID de la familia de productos a la que pertenece',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  productFamilyId?: number;

  @ApiPropertyOptional({
    description: 'ID del IPV al que pertenece el producto',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  ipvId?: number;
}

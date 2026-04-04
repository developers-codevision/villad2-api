import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Código único del producto',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  code?: number;

  @ApiPropertyOptional({
    description: 'Nombre del producto',
    example: 'Ron Havana Club 7 Años',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Unidad de medida',
    example: 'botella',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitMeasure?: string;

  @ApiPropertyOptional({
    description: 'Volumen o contenido',
    example: '750ml',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  volume?: string;

  @ApiPropertyOptional({
    description: 'ID de la familia de productos',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  productFamilyId?: number;
}

import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductFamilyDto {
  @ApiPropertyOptional({
    description: 'Nombre de la familia de productos',
    example: 'Bebidas Alcohólicas',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Código prefijado para la familia',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  code?: number;
}

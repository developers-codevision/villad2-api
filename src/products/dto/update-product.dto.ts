import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product code',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  code?: number;

  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Rones',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Unit measure',
    example: 'UM',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitMeasure?: string;

  @ApiPropertyOptional({
    description: 'Product volume',
    example: 'VOL.',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  volume?: string;

  @ApiPropertyOptional({
    description: 'Product family id',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  productFamilyId?: number;
}

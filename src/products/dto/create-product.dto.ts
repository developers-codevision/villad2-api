import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product code',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  code: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Rones',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Unit measure',
    example: 'UM',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitMeasure: string;

  @ApiProperty({
    description: 'Product volume',
    example: 'VOL.',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  volume: string;

  @ApiPropertyOptional({
    description: 'Product family id',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  productFamilyId?: number;
}

import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductFamilyDto {
  @ApiPropertyOptional({
    description: 'Family name',
    example: 'Bebidas',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Family code prefix',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  code?: number;
}

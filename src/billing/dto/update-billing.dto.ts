import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBillingItemDto {
  @ApiProperty({
    description: 'ID del concepto a actualizar',
    example: 1,
  })
  @IsInt()
  conceptId: number;

  @ApiProperty({
    description: 'Nueva cantidad para este concepto',
    example: 15,
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'Nuevo precio unitario en USD',
    example: 5.00,
  })
  @IsNumber()
  @IsOptional()
  priceUsd?: number;
}

export class UpdateBillingDto {
  @ApiPropertyOptional({
    description: 'Tasa de cambio USD a CUP',
    example: 150.00,
  })
  @IsNumber()
  @IsOptional()
  usdToCupRate?: number;

  @ApiPropertyOptional({
    description: 'Tasa de cambio EUR a CUP',
    example: 160.00,
  })
  @IsNumber()
  @IsOptional()
  eurToCupRate?: number;

  @ApiPropertyOptional({
    description: 'Items a actualizar (conceptId + quantity)',
    type: [UpdateBillingItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBillingItemDto)
  @IsOptional()
  items?: UpdateBillingItemDto[];
}

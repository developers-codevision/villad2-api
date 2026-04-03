import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class DailyRecordItemDto {
  @ApiProperty({ description: 'Product id', example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiPropertyOptional({
    description: 'Initial stock',
    example: 20,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  initial?: number;

  @ApiPropertyOptional({
    description: 'Incoming stock',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  incoming?: number;

  @ApiPropertyOptional({ description: 'Consumption', example: 8, default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  consumption?: number;

  @ApiPropertyOptional({
    description: 'Wastage (merma)',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  waste?: number;

  @ApiPropertyOptional({
    description: 'Home consumption (C. Casa)',
    example: 2,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  homeConsumption?: number;

  @ApiPropertyOptional({ description: 'Final stock', example: 14, default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  final?: number;

  @ApiPropertyOptional({
    description: 'Additional observations',
    example: 'Inventario actualizado al cierre.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observations?: string;
}

export class SaveDailyIpvDto {
  @ApiProperty({
    description: 'Date for this IPV record (YYYY-MM-DD)',
    example: '2026-03-19',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Array of product daily records to save',
    type: [DailyRecordItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => DailyRecordItemDto)
  records: DailyRecordItemDto[];
}

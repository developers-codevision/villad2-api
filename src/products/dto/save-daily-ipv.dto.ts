import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class DailyRecordItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiPropertyOptional({
    description: 'Stock inicial del día',
    example: 20,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  initial?: number;

  @ApiPropertyOptional({
    description: 'Entradas/Inventario recibido',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  incoming?: number;

  @ApiPropertyOptional({
    description: 'Consumo/Ventas del día',
    example: 8,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  consumption?: number;

  @ApiPropertyOptional({
    description: 'Merma/Desperdicio',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  waste?: number;

  @ApiPropertyOptional({
    description: 'Consumo de casa',
    example: 2,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  homeConsumption?: number;

  @ApiPropertyOptional({
    description: 'Stock final después de cerrar',
    example: 14,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsNumber({ maxDecimalPlaces: 2 })
  final?: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Inventario actualizado al cierre.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observations?: string;
}

export class SaveDailyIpvDto {
  @ApiProperty({
    description: 'Fecha del registro de IPV (YYYY-MM-DD)',
    example: '2026-03-19',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Lista de registros diarios de productos',
    type: [DailyRecordItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => DailyRecordItemDto)
  records: DailyRecordItemDto[];
}

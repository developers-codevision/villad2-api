import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateBillingItemDto {
  @ApiProperty({
    description: 'ID del concepto facturable',
    example: 1,
  })
  @IsInt()
  conceptId: number;

  @ApiProperty({
    description: 'Cantidad del concepto',
    example: 10,
  })
  @IsNumber()
  quantity: number;
}

export class CreateBillingDto {
  @ApiPropertyOptional({
    description: 'Fecha de la hoja de facturación diaria (YYYY-MM-DD). Si no se proporciona, usa la fecha actual.',
    example: '2026-04-03',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;
}

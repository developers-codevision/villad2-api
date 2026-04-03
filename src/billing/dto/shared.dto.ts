import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional, IsString } from 'class-validator';

export class BillDenominationDto {
  @ApiProperty({
    description: 'Valor del billete/moneda (ej: 10, 20, 50)',
    example: 10,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Cantidad de billetes/moneda de esta denominación',
    example: 5,
  })
  @IsNumber()
  quantity: number;
}

export class ConceptConsumptionDto {
  @ApiProperty({
    description: 'ID del billing item (si existe)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  billingItemId?: number;

  @ApiProperty({ description: 'ID del concepto facturado', example: 1 })
  @IsInt()
  conceptId: number;

  @ApiProperty({ description: 'Nombre del concepto', example: 'Cerveza' })
  @IsString()
  conceptName: string;

  @ApiProperty({ description: 'Cantidad consumida', example: 3 })
  @IsNumber()
  quantityConsumed: number;
}

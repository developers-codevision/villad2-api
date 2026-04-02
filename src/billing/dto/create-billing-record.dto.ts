import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsArray, ValidateNested, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BillDenominationDto {
  @ApiProperty({ description: 'Valor del billete (ej: 10, 20, 50)', example: 10 })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Cantidad de billetes de esta denominación', example: 5 })
  @IsNumber()
  quantity: number;
}

export class ConceptConsumptionDto {
  @ApiProperty({ description: 'ID del billing item (si existe)', example: 1, required: false })
  @IsInt()
  @IsOptional()
  billingItemId?: number;

  @ApiProperty({ description: 'ID del concepto facturado', example: 1 })
  @IsInt()
  conceptId: number;

  @ApiProperty({ description: 'Nombre del concepto', example: 'Cerveza' })
  conceptName: string;

  @ApiProperty({ description: 'Cantidad consumida', example: 3 })
  @IsNumber()
  quantityConsumed: number;
}

export class CreateBillingRecordDto {
  @ApiProperty({ description: 'ID del billing al que pertenece este registro', example: 1 })
  @IsInt()
  billingId: number;

  @ApiProperty({ description: 'Fecha del registro (YYYY-MM-DD)', example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Denominaciones de billetes usadas para pagar', type: [BillDenominationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillDenominationDto)
  billDenominations: BillDenominationDto[];

  @ApiProperty({ description: 'Total entregado por el cliente', example: 500 })
  @IsNumber()
  totalPaid: number;

  @ApiProperty({ description: 'Total a pagar por los productos', example: 240 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Vuelto entregado al cliente', example: 260 })
  @IsNumber()
  change: number;

  @ApiProperty({ description: 'Propina', example: 20, default: 0 })
  @IsNumber()
  @IsOptional()
  tip?: number;

  @ApiProperty({ description: '10% del costo (impuesto/servicio)', example: 24 })
  @IsNumber()
  tax10Percent: number;

  @ApiProperty({ description: 'Consumo de conceptos facturados', type: [ConceptConsumptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptConsumptionDto)
  conceptConsumptions: ConceptConsumptionDto[];

  @ApiProperty({ description: 'Consumir inventario inmediatamente (true) o dejar pendiente (false)', example: true, default: true, required: false })
  @IsOptional()
  consumeImmediately?: boolean;
}

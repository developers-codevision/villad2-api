import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBillingItemDto {
  @ApiProperty({ description: 'Concept ID to update' })
  @IsInt()
  conceptId: number;

  @ApiProperty({ description: 'New quantity for this concept' })
  @IsNumber()
  quantity: number;
}

export class BillDenominationDto {
  @ApiProperty({ description: 'Valor del billete (ej: 10, 20, 50)', example: 10 })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Cantidad de billetes de esta denominación', example: 5 })
  @IsNumber()
  quantity: number;
}

export class ProductConsumptionDto {
  @ApiProperty({ description: 'ID del producto consumido', example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Nombre del producto', example: 'Cerveza' })
  productName: string;

  @ApiProperty({ description: 'Cantidad consumida del inventario', example: 3 })
  @IsNumber()
  quantityConsumed: number;
}

export class UpdateBillingDto {
  @ApiProperty({ description: 'USD to CUP exchange rate', required: false })
  @IsNumber()
  @IsOptional()
  usdToCupRate?: number;

  @ApiProperty({ description: 'EUR to CUP exchange rate', required: false })
  @IsNumber()
  @IsOptional()
  eurToCupRate?: number;

  @ApiProperty({ description: 'Items to update (conceptId + quantity)', type: [UpdateBillingItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBillingItemDto)
  @IsOptional()
  items?: UpdateBillingItemDto[];

  // Campos para registro de pago
  @ApiProperty({ description: 'Denominaciones de billetes usadas para pagar', type: [BillDenominationDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillDenominationDto)
  @IsOptional()
  billDenominations?: BillDenominationDto[];

  @ApiProperty({ description: 'Total entregado por el cliente', example: 500, required: false })
  @IsNumber()
  @IsOptional()
  totalPaid?: number;

  @ApiProperty({ description: 'Total a pagar por los productos', example: 240, required: false })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({ description: 'Vuelto entregado al cliente', example: 260, required: false })
  @IsNumber()
  @IsOptional()
  change?: number;

  @ApiProperty({ description: 'Propina', example: 20, default: 0, required: false })
  @IsNumber()
  @IsOptional()
  tip?: number;

  @ApiProperty({ description: '10% del costo (impuesto/servicio)', example: 24, required: false })
  @IsNumber()
  @IsOptional()
  tax10Percent?: number;

  @ApiProperty({ description: 'Consumo de productos del inventario', type: [ProductConsumptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductConsumptionDto)
  @IsOptional()
  productConsumptions?: ProductConsumptionDto[];
}

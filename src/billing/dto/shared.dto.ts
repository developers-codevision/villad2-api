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

export class ProductConsumptionDto {
  @ApiProperty({
    description: 'ID del billing item (si existe)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  billingItemId?: number;

  @ApiProperty({ description: 'ID del producto del inventario', example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Cantidad consumida', example: 2 })
  @IsNumber()
  quantityConsumed: number;
}

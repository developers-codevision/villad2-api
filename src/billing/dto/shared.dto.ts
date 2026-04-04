import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional, IsString } from 'class-validator';

export class CurrencyDto {
  @ApiProperty({
    description: 'Moneda de esta denominación',
    enum: ['USD', 'EUR', 'CUP'],
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Valor del billete/moneda',
    example: 20,
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
  @ApiPropertyOptional({
    description: 'ID del billing item (si existe)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  billingItemId?: number;

  @ApiProperty({
    description: 'ID del producto del inventario',
    example: 1,
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Cantidad consumida del producto',
    example: 2,
  })
  @IsNumber()
  quantityConsumed: number;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductConsumptionDto } from './shared.dto';

export enum PaymentMethod {
  CASH_USD = 'cash_usd',
  CASH_EUR = 'cash_eur',
  CASH_CUP = 'cash_cup',
  TRANSFER_MOBILE = 'transfer_mobile',
  BIZUM = 'bizum',
  ZELLE = 'zelle',
  TRANSFER_ABROAD = 'transfer_abroad',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  CUP = 'CUP',
}

export enum ConceptSource {
  MINIBAR = 'minibar',
  TERRAZA = 'terraza',
  ALOJAMIENTO = 'alojamiento',
  OTHER = 'other',
}

export class BillingItemDto {
  @ApiProperty({
    description: 'ID del producto de inventario a descontar',
    example: 1,
    required: true,
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Cantidad del producto a descontar',
    example: 1,
    required: true,
  })
  @IsNumber()
  productQuantity: number;
}

export class BillDenominationDto {
  @ApiProperty({
    description: 'Moneda de esta denominación',
    enum: Currency,
    example: 'USD',
  })
  @IsEnum(Currency)
  currency: Currency;

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

export class BillingPaymentDto {
  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    example: 'cash_usd',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Monto pagado en USD (requerido si no hay billDenominations)',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Denominaciones de billetes (para pagos en efectivo)',
    type: [BillDenominationDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillDenominationDto)
  @IsOptional()
  billDenominations?: BillDenominationDto[];
}

export class CreateBillingRecordDto {
  @ApiProperty({
    description: 'ID del billing al que pertenece este registro',
    example: 1,
  })
  @IsInt()
  billingId: number;

  @ApiProperty({
    description: 'ID del billing item para saber precio y demas',
    example: 1,
    required: true,
  })
  @IsInt()
  billingItemId: number;

  @ApiProperty({
    description: 'ID de la reservación asociada (para acumular deuda/anticipo)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  reservationId?: number;

  @ApiProperty({
    description: 'Items facturados con precios individuales',
    type: [BillingItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillingItemDto)
  items: BillingItemDto[];

  @ApiProperty({ description: 'Propina', example: 20, default: 0 })
  @IsNumber()
  @IsOptional()
  tip?: number;

  @ApiProperty({
    description: 'Pagos realizados',
    type: [BillingPaymentDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillingPaymentDto)
  @IsOptional()
  payments?: BillingPaymentDto[];

  @ApiProperty({
    description:
      'Consumir inventario inmediatamente (true) o dejar pendiente (false)',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  consumeImmediately?: boolean;

  @ApiProperty({
    description:
      'Facturación diferida - si true, no se cobra en el momento y se crea deuda al cliente',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  lateBilling?: boolean;
}

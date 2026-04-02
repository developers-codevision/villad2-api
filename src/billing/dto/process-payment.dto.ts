import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class BillDenominationDto {
  @ApiProperty({ description: 'Valor del billete', example: 10 })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Cantidad de billetes', example: 5 })
  @IsNumber()
  quantity: number;
}

export class PaymentInputDto {
  @ApiProperty({ description: 'Método de pago', enum: ['cash_usd', 'cash_eur', 'cash_cup', 'transfer_mobile', 'bizum', 'zelle', 'transfer_abroad', 'stripe', 'paypal'] })
  @IsEnum(['cash_usd', 'cash_eur', 'cash_cup', 'transfer_mobile', 'bizum', 'zelle', 'transfer_abroad', 'stripe', 'paypal'])
  paymentMethod: 'cash_usd' | 'cash_eur' | 'cash_cup' | 'transfer_mobile' | 'bizum' | 'zelle' | 'transfer_abroad' | 'stripe' | 'paypal';

  @ApiProperty({ description: 'Moneda', enum: ['USD', 'EUR', 'CUP'] })
  @IsEnum(['USD', 'EUR', 'CUP'])
  currency: 'USD' | 'EUR' | 'CUP';

  @ApiProperty({ description: 'Monto pagado', example: 100 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Tasa de cambio (opcional)', example: 240, required: false })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @ApiProperty({ description: 'Desglose de billetes para efectivo', type: [BillDenominationDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillDenominationDto)
  @IsOptional()
  billDenominations?: BillDenominationDto[];

  @ApiProperty({ description: 'Es anticipo', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAdvance?: boolean;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Lista de pagos', type: [PaymentInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentInputDto)
  payments: PaymentInputDto[];

  @ApiProperty({ description: 'Usar anticipos disponibles', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  useAdvanceBalance?: boolean;
}

export class PaymentResultDto {
  @ApiProperty({ description: 'Total pagado en USD' })
  totalPaid: number;

  @ApiProperty({ description: 'Total a pagar' })
  grandTotal: number;

  @ApiProperty({ description: 'Monto pendiente' })
  pendingAmount: number;

  @ApiProperty({ description: 'Balance de anticipos' })
  advanceBalance: number;

  @ApiProperty({ description: 'Estado del pago', enum: ['pending', 'partial', 'paid', 'overpaid'] })
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overpaid';

  @ApiProperty({ description: 'Vuelto' })
  change: number;

  @ApiProperty({ description: 'Pagos registrados' })
  payments: BillingPayment[];
}

import { BillingPayment } from '../entities/billing-payment.entity';

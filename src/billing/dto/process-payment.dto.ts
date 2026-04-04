import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrencyDto } from './shared.dto';

export class PaymentInputDto {
  @ApiProperty({
    description: 'Método de pago',
    enum: ['cash_usd', 'cash_eur', 'cash_cup', 'transfer_mobile', 'bizum', 'zelle', 'transfer_abroad', 'stripe', 'paypal'],
    example: 'cash_usd',
  })
  @IsEnum(['cash_usd', 'cash_eur', 'cash_cup', 'transfer_mobile', 'bizum', 'zelle', 'transfer_abroad', 'stripe', 'paypal'])
  paymentMethod: 'cash_usd' | 'cash_eur' | 'cash_cup' | 'transfer_mobile' | 'bizum' | 'zelle' | 'transfer_abroad' | 'stripe' | 'paypal';

  @ApiProperty({
    description: 'Moneda del pago',
    enum: ['USD', 'EUR', 'CUP'],
    example: 'USD',
  })
  @IsEnum(['USD', 'EUR', 'CUP'])
  currency: 'USD' | 'EUR' | 'CUP';

  @ApiProperty({
    description: 'Monto pagado',
    example: 100,
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Tasa de cambio (para conversions)',
    example: 150,
  })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @ApiPropertyOptional({
    description: 'Desglose de billetes para pagos en efectivo',
    type: [CurrencyDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurrencyDto)
  @IsOptional()
  billDenominations?: CurrencyDto[];

  @ApiPropertyOptional({
    description: 'Indica si es un anticipo',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isAdvance?: boolean;
}

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Lista de pagos a procesar',
    type: [PaymentInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentInputDto)
  payments: PaymentInputDto[];

  @ApiPropertyOptional({
    description: 'Usar saldo de anticipos disponible',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  useAdvanceBalance?: boolean;
}

export class PaymentResultDto {
  @ApiProperty({
    description: 'Total pagado convertido a USD',
    example: 100.00,
  })
  totalPaid: number;

  @ApiProperty({
    description: 'Total a pagar incluyendo impuestos y propinas',
    example: 110.00,
  })
  grandTotal: number;

  @ApiProperty({
    description: 'Monto pendiente por pagar',
    example: 10.00,
  })
  pendingAmount: number;

  @ApiProperty({
    description: 'Balance de anticipos restantes',
    example: 0,
  })
  advanceBalance: number;

  @ApiProperty({
    description: 'Estado del pago',
    enum: ['pending', 'partial', 'paid', 'overpaid'],
    example: 'paid',
  })
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overpaid';

  @ApiProperty({
    description: 'Vuelto/cambio a devolver',
    example: 0,
  })
  change: number;

  @ApiProperty({
    description: 'Lista de pagos registrados',
  })
  payments: any[];
}

export { CurrencyDto };

import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la reservación' })
  @IsNumber()
  reservationId: number;

  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Moneda (ej: usd, eur, mxn)' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de pago',
    enum: PaymentType,
    default: PaymentType.RESERVATION,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @ApiPropertyOptional({ description: 'ID del cliente en Stripe' })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsOptional()
  metadata?: Record<string, any>;
}

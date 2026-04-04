import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID de la reservación asociada',
    example: 1,
  })
  @IsNumber()
  reservationId: number;

  @ApiProperty({
    description: 'Monto del pago en la moneda especificada',
    example: 150.00,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Moneda del pago',
    example: 'usd',
  })
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

  @ApiPropertyOptional({
    description: 'ID del cliente en Stripe',
    example: 'cus_123456789',
  })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales para el pago',
    example: { orderId: 'ORD-001' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

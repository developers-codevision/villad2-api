import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';
import { PaymentType } from '../../payments/entities/payment.entity';

export class CreateReservationWithPaymentDto extends CreateReservationDto {
  @ApiPropertyOptional({ 
    description: 'ID del cliente en Stripe',
    example: 'cus_1234567890'
  })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de pago',
    enum: PaymentType,
    default: PaymentType.RESERVATION 
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({ 
    description: 'Moneda para el pago',
    example: 'usd'
  })
  @IsOptional()
  @IsString()
  currency?: string;
}

import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../../payments/entities/payment.entity';

export class CreatePaypalPaymentDto {
  @IsNumber()
  reservationId: number;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  metadata?: Record<string, any>;
}

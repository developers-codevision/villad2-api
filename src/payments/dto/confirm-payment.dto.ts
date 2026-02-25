import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'ID del PaymentIntent de Stripe' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'ID del método de pago' })
  @IsString()
  paymentMethodId: string;
}

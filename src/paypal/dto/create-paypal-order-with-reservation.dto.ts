import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentType } from '../../payments/entities/payment.entity';
import { CreateReservationDto } from '../../reservations/dto/create-reservation.dto';

export class CreatePaypalOrderWithReservationDto {
  @ApiProperty({
    description: 'Reservation data to create the reservation and calculate the total price',
    type: () => CreateReservationDto,
  })
  reservation: CreateReservationDto;

  @ApiPropertyOptional({
    description: 'Currency for the payment (defaults to USD)',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Payment type',
    enum: PaymentType,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @ApiPropertyOptional({
    description: 'Additional metadata for the payment',
    example: { source: 'web', campaign: 'summer2024' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReservationStatus } from './create-reservation.dto';

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la reservacion',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}

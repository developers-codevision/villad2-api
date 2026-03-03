import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReservationDto } from '../../reservations/dto/create-reservation.dto';

export class CreatePaypalOrderWithReservationDto {
  @ApiProperty({
    description:
      'Reservation data to create the reservation and calculate the total price',
    type: () => CreateReservationDto,
  })
  @ValidateNested()
  @Type(() => CreateReservationDto)
  reservation: CreateReservationDto;
}

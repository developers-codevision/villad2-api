import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus } from '../../rooms/enums/room-enums.enum';

export class CheckInDto {}

export class CheckOutDto {
  @ApiPropertyOptional({
    description: 'Room status after check-out (optional, defaults to VACIA_SUCIA)',
    enum: RoomStatus,
    example: RoomStatus.VACIA_SUCIA,
  })
  @IsOptional()
  @IsEnum(RoomStatus)
  roomStatus?: RoomStatus;
}

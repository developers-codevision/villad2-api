import { ApiProperty } from '@nestjs/swagger';

export class HourRange {
  @ApiProperty({
    description:
      'Fecha y hora de inicio del rango ocupado (formato YYYY-MM-DDTHH:mm)',
    example: '2026-03-02T12:00',
  })
  start: string;

  @ApiProperty({
    description:
      'Fecha y hora de fin del rango ocupado (formato YYYY-MM-DDTHH:mm)',
    example: '2026-03-05T16:00',
  })
  end: string;
}

export class AllRoomsOccupiedHours {
  [roomId: number]: HourRange[];
}

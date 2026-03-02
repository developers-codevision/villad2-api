import { ApiProperty } from '@nestjs/swagger';

export class HourRange {
  @ApiProperty({
    description: 'Hora de inicio del rango ocupado (formato HH:mm)',
    example: '14:00',
  })
  start: string;

  @ApiProperty({
    description: 'Hora de fin del rango ocupado (formato HH:mm)',
    example: '18:00',
  })
  end: string;
}

export class DayOccupiedHours {
  @ApiProperty({
    description: 'Fecha del día (formato YYYY-MM-DD)',
    example: '2024-03-15',
  })
  date: string;

  @ApiProperty({
    description: 'Array de rangos de horas ocupadas. null si el día está completamente libre',
    type: [HourRange],
    nullable: true,
  })
  occupiedRanges: HourRange[] | null;
}

export class RoomOccupiedHours {
  @ApiProperty({
    description: 'ID de la habitación',
    example: 1,
  })
  roomId: number;

  @ApiProperty({
    description: 'Array de días con sus rangos de horas ocupadas',
    type: [DayOccupiedHours],
  })
  days: DayOccupiedHours[];
}

export class AllRoomsOccupiedHours {
  [roomId: number]: DayOccupiedHours[];
}

import { IsNumber, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDailyAttendanceDto {
  @ApiProperty({
    description: 'ID del trabajador',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({
    description: 'Fecha y hora de la asistencia',
    example: '2026-03-26T08:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  attendanceDateTime: Date;
}

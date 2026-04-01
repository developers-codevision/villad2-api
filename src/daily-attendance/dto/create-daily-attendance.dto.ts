import { IsNumber, IsNotEmpty, IsDate, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDailyAttendanceDto {
  @ApiProperty({ example: 1, description: 'Associated Worker ID' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'El ID del trabajador debe ser un número positivo' })
  @Max(999999, { message: 'El ID del trabajador excede el límite razonable' })
  staffId: number;

  @ApiProperty({ example: '2026-03-26T08:00:00Z', description: 'DailyAttendance Date and Time' })
  @Type(()=> Date)
  @IsDate()
  @IsNotEmpty()
  attendanceDateTime: Date;
}

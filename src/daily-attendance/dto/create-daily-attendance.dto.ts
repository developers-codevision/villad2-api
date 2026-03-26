import { IsNumber, IsDateString, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDailyAttendanceDto {
  @ApiProperty({ example: 1, description: 'Associated Worker ID' })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({ example: '2026-03-26T08:00:00Z', description: 'DailyAttendance Date and Time' })
  @Type(()=> Date)
  @IsDate()
  @IsNotEmpty()
  attendanceDateTime: Date;
}

import { IsNumber, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVacationDto {
  @ApiProperty({ example: 1, description: 'ID del trabajador asociado (Staff)' })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({ example: '2026-04-01', description: 'Fecha de inicio de las vacaciones' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ example: '2026-04-15', description: 'Fecha de fin de las vacaciones' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
import { IsNumber, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVacationDto {
  @ApiProperty({
    description: 'ID del trabajador',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({
    description: 'Fecha de inicio de las vacaciones',
    example: '2026-04-01',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin de las vacaciones',
    example: '2026-04-15',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}

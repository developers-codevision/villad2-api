import { IsNumber, IsNotEmpty, IsString, MaxLength, IsDate, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAbsenceDto {
  @ApiProperty({
    description: 'ID del trabajador',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({
    description: 'Fecha de la ausencia',
    example: '2026-05-10',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Razón o motivo de la ausencia',
    example: 'Cita médica',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'La razón solo puede contener letras, números y espacios',
  })
  @MaxLength(255)
  reason: string;
}

import { IsNumber, IsDateString, IsNotEmpty, IsString, MaxLength, IsDate, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAbsenceDto {
  @ApiProperty({ example: 1, description: 'ID del trabajador asociado (Staff)' })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({ example: '2026-05-10', description: 'Fecha de la ausencia' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ example: 'Cita médica referenciada', description: 'Razón de la ausencia' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'La razón solo puede contener letras, números y espacios (sin símbolos)',
  })
  @MaxLength(255)
  reason: string;
}
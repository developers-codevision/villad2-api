import { IsNumber, IsNotEmpty, IsString, MaxLength, IsDate, Matches, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAbsenceDto {
  @ApiProperty({ example: 1, description: 'ID del trabajador asociado (Staff)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'El ID del trabajador debe ser un número positivo' })
  @Max(999999, { message: 'El ID del trabajador excede el límite razonable' })

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
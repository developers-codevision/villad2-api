import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'El nombre del trabajador',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // 1. Trim para eliminar espacios al inicio y final
      let cleaned = value.trim();

      // 2. Normalizar espacios múltiples a uno solo
      cleaned = cleaned.replace(/\s+/g, ' ');

      // 3. Validar que no sea solo espacios
      if (cleaned.length === 0) {
        return '';
      }

      // 4. Capitalizar primera letra de cada palabra
      cleaned = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());

      return cleaned;
    }
    return value;
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del trabajador es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúñÑ\s]+$/, {
    message:
      'El nombre solo puede contener letras y espacios (sin números ni símbolos)',
  })
  staffname: string;
}

import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryDto {
  @ApiProperty({
    example: 1,
    description: 'ID del trabajador asociado (Staff)',
  })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({ example: 1500.5, description: 'Monto del salario' })
  @IsNumber()
  @Min(0, { message: 'El salario no puede ser negativo' })
  @Max(9999999.99, { message: 'Salario excede el límite de la base de datos' })
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: 'Turno nocturno',
    description: 'Comentario o descripción del salario (Opcional)',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, {
    message:
      'La descripción solo puede contener letras, números y espacios (sin símbolos)',
  })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  comment?: string;
}

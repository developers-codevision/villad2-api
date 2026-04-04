import { IsNumber, IsString, IsNotEmpty, IsOptional, MaxLength, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryDto {
  @ApiProperty({
    description: 'ID del trabajador asociado',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({
    description: 'Monto del salario en USD',
    example: 1500.50,
  })
  @IsNumber()
  @Min(0, { message: 'El salario no puede ser negativo' })
  @Max(9999999.99, { message: 'Salario excede el límite de la base de datos' })
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    description: 'Comentario o descripción adicional del salario',
    example: 'Pago de turno nocturno de diciembre',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'La descripción solo puede contener letras, números y espacios',
  })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  comment?: string;
}

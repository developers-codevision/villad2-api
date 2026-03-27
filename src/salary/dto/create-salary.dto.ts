import { IsNumber, IsString, IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryDto {
  @ApiProperty({ example: 1, description: 'ID del trabajador asociado (Staff)' })
  @IsNumber()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({ example: 1500.50, description: 'Monto del salario' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'Turno nocturno', description: 'Comentario o descripción del salario (Opcional)' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  comment?: string;
}

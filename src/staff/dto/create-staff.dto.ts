import { IsNotEmpty, IsString, MaxLength, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffType } from '../entities/staff.entity';

export class CreateStaffDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'El nombre del trabajador' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del trabajador es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Matches(/^(?=.*[a-zA-ZáéíóúñÑ])[a-zA-ZáéíóúñÑ\s]+$/, { 
  message: 'El nombre debe contener al menos una letra (no solo espacios, ni números, ni caracteres especiales)' 
})
  staffname: string;

  @ApiProperty({ example: '96122578601', description: 'El número de expediente (carnet de identidad del trabajador)' })
  @IsString({ message: 'El número de expediente debe ser texto' })
  @IsNotEmpty({ message: 'El número de expediente es requerido' })
  @MaxLength(20, { message: 'El número de expediente no puede exceder 20 caracteres' })
  @Matches(/^[0-9]{11}$/, { 
  message: 'El carnet debe tener exactamente 11 dígitos numéricos (sin espacios, sin guiones)' 
})
  expNumber: string;

  @ApiPropertyOptional({ enum: StaffType, description: 'El tipo de trabajador' })
  @IsEnum(StaffType, { message: 'El tipo de trabajador debe ser uno de: gerente, supervisora, Tec Contable, Recepcionista' })
  @IsOptional()
  type?: StaffType;
}

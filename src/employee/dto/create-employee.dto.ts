import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Juan Perez', description: 'El nombre del trabajador' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  employeename: string;
}

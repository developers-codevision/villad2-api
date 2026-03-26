import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ example: 'Juan Perez', description: 'El nombre del trabajador' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  staffname: string;
}

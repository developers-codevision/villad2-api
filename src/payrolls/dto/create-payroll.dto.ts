import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CreatePayrollDto {
  @ApiProperty({ example: 10, description: 'Mes de la nómina (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2024, description: 'Año de la nómina' })
  @IsInt()
  @Min(1980)
  @Max(3000)
  year: number;
}


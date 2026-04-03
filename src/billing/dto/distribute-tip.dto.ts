import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkerInputDto {
  @ApiProperty({ description: 'ID del trabajador', example: 1 })
  @IsInt()
  workerId: number;

  @ApiProperty({ description: 'Nombre del trabajador', example: 'Juan Pérez' })
  @IsString()
  workerName: string;

  @ApiProperty({ description: 'Porcentaje de distribución', example: 50 })
  @IsNumber()
  percentage: number;
}

export class DistributeTipDto {
  @ApiProperty({
    description: 'Lista de trabajadores y porcentajes',
    type: [WorkerInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerInputDto)
  workers: WorkerInputDto[];
}

export class DistributeTax10Dto {
  @ApiProperty({
    description: 'Lista de trabajadores y porcentajes',
    type: [WorkerInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerInputDto)
  workers: WorkerInputDto[];
}

export class ReportPeriodDto {
  @ApiProperty({
    description: 'Fecha inicio (ISO)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'Fecha fin (ISO)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsString()
  to: string;
}

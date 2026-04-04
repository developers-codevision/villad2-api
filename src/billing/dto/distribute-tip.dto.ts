import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkerInputDto {
  @ApiProperty({
    description: 'ID del trabajador',
    example: 1,
  })
  @IsInt()
  workerId: number;

  @ApiProperty({
    description: 'Nombre del trabajador',
    example: 'Juan Pérez',
  })
  @IsString()
  workerName: string;

  @ApiProperty({
    description: 'Porcentaje de distribución de propinas',
    example: 50,
  })
  @IsNumber()
  percentage: number;
}

export class DistributeTipDto {
  @ApiProperty({
    description: 'Lista de trabajadores y sus porcentajes de distribución de propinas',
    type: [WorkerInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerInputDto)
  workers: WorkerInputDto[];
}

export class DistributeTax10Dto {
  @ApiProperty({
    description: 'Lista de trabajadores y sus porcentajes del impuesto 10%',
    type: [WorkerInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerInputDto)
  workers: WorkerInputDto[];
}

export class ReportPeriodDto {
  @ApiProperty({
    description: 'Fecha de inicio del período',
    example: '2026-01-01',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'Fecha de fin del período',
    example: '2026-04-03',
  })
  @IsString()
  to: string;
}

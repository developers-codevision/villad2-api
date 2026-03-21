import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateConceptDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  priceUsd: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;
}

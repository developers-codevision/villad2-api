import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateBillingItemDto {
  @ApiProperty()
  @IsInt()
  conceptId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateBillingDto {
  @ApiProperty({
    description:
      'Date for the daily billing sheet (YYYY-MM-DD). If not provided, uses today.',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;
}

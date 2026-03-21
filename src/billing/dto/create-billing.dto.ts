import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBillingItemDto {
  @ApiProperty()
  @IsInt()
  conceptId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateBillingDto {
  @ApiProperty({ description: 'Date of the daily billing sheet (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'USD to CUP exchange rate', default: 1 })
  @IsNumber()
  usdToCupRate: number;

  @ApiProperty({ description: 'EUR to CUP exchange rate', default: 1 })
  @IsNumber()
  eurToCupRate: number;

  @ApiProperty({ type: [CreateBillingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillingItemDto)
  items: CreateBillingItemDto[];
}

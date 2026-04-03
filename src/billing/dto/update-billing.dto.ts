import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillDenominationDto } from './shared.dto';

export class UpdateBillingItemDto {
  @ApiProperty({ description: 'Concept ID to update' })
  @IsInt()
  conceptId: number;

  @ApiProperty({ description: 'New quantity for this concept' })
  @IsNumber()
  quantity: number;
}

export class UpdateBillingDto {
  @ApiProperty({ description: 'USD to CUP exchange rate', required: false })
  @IsNumber()
  @IsOptional()
  usdToCupRate?: number;

  @ApiProperty({ description: 'EUR to CUP exchange rate', required: false })
  @IsNumber()
  @IsOptional()
  eurToCupRate?: number;

  @ApiProperty({
    description: 'Items to update (conceptId + quantity)',
    type: [UpdateBillingItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBillingItemDto)
  @IsOptional()
  items?: UpdateBillingItemDto[];
}

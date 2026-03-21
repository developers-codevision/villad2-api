import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExtraBillingItemDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;
}

export class CreateExtraBillingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiProperty({ type: [CreateExtraBillingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExtraBillingItemDto)
  items: CreateExtraBillingItemDto[];
}

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PromotionStatus } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'Promotion title',
    maxLength: 255,
    example: 'Summer Special Package',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Maximum number of people',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  maxPeople?: number;

  @ApiPropertyOptional({
    description: 'Minimum number of people',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  minPeople?: number;

  @ApiPropertyOptional({
    description: 'Duration time (in hours or days)',
    maxLength: 100,
    example: '7 days',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  time?: string;

  @ApiPropertyOptional({
    description: 'Services included in promotion',
    example: ['breakfast', 'spa', 'guided-tours'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((service) => service.trim());
    }
    return value as string[];
  })
  services?: string[];

  @ApiPropertyOptional({
    description: 'Promotion description',
    example: 'Enjoy our summer special with all meals included',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Check-in time',
    maxLength: 10,
    example: '15:00',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  checkInTime?: string;

  @ApiPropertyOptional({
    description: 'Check-out time',
    maxLength: 10,
    example: '11:00',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  checkOutTime?: string;

  @ApiPropertyOptional({
    description: 'Promotion photo path',
    example: 'media/promotions/promo1.jpg',
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({
    description: 'Promotion status',
    enum: PromotionStatus,
    default: PromotionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;
}

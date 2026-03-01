import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Name of the reviewer',
    maxLength: 255,
    example: 'John Doe',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Country of the reviewer',
    maxLength: 255,
    example: 'United States',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiPropertyOptional({
    description: 'Review title',
    maxLength: 255,
    example: 'Excellent Stay',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Review content',
    example: 'Great experience! The service was excellent.',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Star rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  stars?: number;

  @ApiPropertyOptional({
    description: 'Response to the review',
    example: 'Thank you for your feedback!',
  })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiPropertyOptional({
    description: 'Review status',
    enum: ReviewStatus,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}

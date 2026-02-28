import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionStatus } from '../entities/promotion.entity';

export class FindPromotionsDto {
  @ApiPropertyOptional({
    description: 'Filter by promotion status',
    enum: PromotionStatus,
    example: PromotionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;
}

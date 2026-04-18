import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '../entities/blog.entity';

export class FindBlogDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado del blog',
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Buscar por término en título o descripción',
    example: 'habana',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

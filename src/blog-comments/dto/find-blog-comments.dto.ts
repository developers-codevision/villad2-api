import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BlogCommentStatus } from '../entities/blog-comment.entity';

export class FindBlogCommentsDto {
  @ApiPropertyOptional({
    description: 'ID del articulo',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  postId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del comentario',
    enum: BlogCommentStatus,
    example: BlogCommentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BlogCommentStatus)
  status?: BlogCommentStatus;

  @ApiPropertyOptional({
    description: 'Numero de pagina',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por pagina',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

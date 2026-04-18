import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '../entities/blog.entity';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Título del blog',
    maxLength: 255,
    example: 'Guía completa para visitar La Habana',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug (único)',
    maxLength: 255,
    example: 'guia-completa-para-visitar-la-habana',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción corta/resumen',
    example: 'Descubre los mejores lugares para visitar en La Habana...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Contenido HTML (será sanitizado para prevenir XSS)',
    example: '<h2>Introducción</h2><p>La Habana es una ciudad...</p>',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Ruta de la imagen destacada',
    maxLength: 500,
    example: 'media/blog/habana-guide.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({
    description: 'Estado del blog',
    enum: BlogStatus,
    default: BlogStatus.HIDDEN,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: 'Fecha de publicación (formato ISO)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

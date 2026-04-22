import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '../entities/blog.entity';

export class UpdateBlogDto {
  @ApiPropertyOptional({
    description: 'Título del blog en español',
    maxLength: 255,
    example: 'Guía completa para visitar La Habana',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titleEs?: string;

  @ApiPropertyOptional({
    description: 'Blog title in English',
    maxLength: 255,
    example: 'Complete guide to visit Havana',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titleEn?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug en español (único)',
    maxLength: 255,
    example: 'guia-completa-para-visitar-la-habana',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slugEs?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug in English (unique)',
    maxLength: 255,
    example: 'complete-guide-to-visit-havana',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slugEn?: string;

  @ApiPropertyOptional({
    description: 'Descripción corta/resumen en español',
    example: 'Descubre los mejores lugares para visitar en La Habana...',
  })
  @IsOptional()
  @IsString()
  descriptionEs?: string;

  @ApiPropertyOptional({
    description: 'Short description/summary in English',
    example: 'Discover the best places to visit in Havana...',
  })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Contenido HTML en español (será sanitizado para prevenir XSS)',
    example: '<h2>Introducción</h2><p>La Habana es una ciudad...</p>',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  contentEs?: string;

  @ApiPropertyOptional({
    description: 'Full HTML content in English (sanitized)',
    example: '<h2>Introduction</h2><p>Havana is a city...</p>',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  contentEn?: string;

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

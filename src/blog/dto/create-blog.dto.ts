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
    description: 'Título del blog en español',
    maxLength: 255,
    example: 'Guía completa para visitar La Habana',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titleEs: string;

  @ApiProperty({
    description: 'Blog title in English',
    maxLength: 255,
    example: 'Complete guide to visit Havana',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titleEn: string;

  @ApiProperty({
    description: 'URL-friendly slug en español (único)',
    maxLength: 255,
    example: 'guia-completa-para-visitar-la-habana',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slugEs: string;

  @ApiProperty({
    description: 'URL-friendly slug in English (unique)',
    maxLength: 255,
    example: 'complete-guide-to-visit-havana',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slugEn: string;

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

  @ApiProperty({
    description: 'Contenido HTML en español (será sanitizado para prevenir XSS)',
    example: '<h2>Introducción</h2><p>La Habana es una ciudad...</p>',
  })
  @IsNotEmpty()
  @IsString()
  contentEs: string;

  @ApiProperty({
    description: 'Full HTML content in English (sanitized)',
    example: '<h2>Introduction</h2><p>Havana is a city...</p>',
  })
  @IsNotEmpty()
  @IsString()
  contentEn: string;

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

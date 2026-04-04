import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Nombre del autor de la reseña',
    maxLength: 255,
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'País del autor de la reseña',
    maxLength: 255,
    example: 'España',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiPropertyOptional({
    description: 'Título de la reseña',
    maxLength: 255,
    example: 'Excelente estancia',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Contenido de la reseña',
    example: 'Gran experiencia!',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Calificación en estrellas (1-5)',
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
    description: 'Respuesta a la reseña',
    example: 'Gracias por su retroalimentación!',
  })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiPropertyOptional({
    description: 'Estado de la reseña',
    enum: ReviewStatus,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}

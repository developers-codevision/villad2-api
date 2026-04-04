import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../entities/review.entity';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Nombre del autor de la reseña',
    maxLength: 255,
    example: 'Juan Pérez',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'País del autor de la reseña',
    maxLength: 255,
    example: 'España',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  country: string;

  @ApiProperty({
    description: 'Título de la reseña',
    maxLength: 255,
    example: 'Excelente estancia',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Contenido de la reseña',
    example: 'Gran experiencia! El servicio fue excelente.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Calificación en estrellas (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number;

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
    default: ReviewStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}

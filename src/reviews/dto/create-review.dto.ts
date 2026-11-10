import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Nombre del autor de la reseña',
    maxLength: 255,
    example: 'Juan Pérez',
  })
  @IsNotEmpty({ message: 'El nombre del autor es obligatorio.' })
  @IsString({ message: 'El nombre del autor debe ser texto.' })
  @MaxLength(255, {
    message: 'El nombre del autor no puede superar los 255 caracteres.',
  })
  name: string;

  @ApiProperty({
    description: 'País del autor de la reseña',
    maxLength: 255,
    example: 'España',
  })
  @IsNotEmpty({ message: 'El país del autor es obligatorio.' })
  @IsString({ message: 'El país del autor debe ser texto.' })
  @MaxLength(255, {
    message: 'El país del autor no puede superar los 255 caracteres.',
  })
  country: string;

  @ApiProperty({
    description: 'Título de la reseña',
    maxLength: 255,
    example: 'Excelente estancia',
  })
  @IsNotEmpty({ message: 'El título de la reseña es obligatorio.' })
  @IsString({ message: 'El título de la reseña debe ser texto.' })
  @MaxLength(255, {
    message: 'El título de la reseña no puede superar los 255 caracteres.',
  })
  title: string;

  @ApiProperty({
    description: 'Contenido de la reseña',
    example: 'Gran experiencia! El servicio fue excelente.',
  })
  @IsNotEmpty({ message: 'El contenido de la reseña es obligatorio.' })
  @IsString({ message: 'El contenido de la reseña debe ser texto.' })
  @MaxLength(350, {
    message: 'El contenido de la reseña no puede superar los 350 caracteres.',
  })
  content: string;

  @ApiProperty({
    description: 'Calificación en estrellas (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'La puntuación es obligatoria.' })
  @IsNumber({}, { message: 'La puntuación debe ser un número.' })
  @Min(1, { message: 'La puntuación mínima es 1 estrella.' })
  @Max(5, { message: 'La puntuación máxima es 5 estrellas.' })
  stars: number;
}

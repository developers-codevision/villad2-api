import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBlogCommentDto {
  @ApiPropertyOptional({
    description: 'Nombre del autor del comentario',
    maxLength: 100,
    example: 'Juan Perez',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Contenido del comentario',
    maxLength: 1000,
    example: 'Excelente articulo.',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @ApiPropertyOptional({
    description: 'Respuesta del administrador',
    maxLength: 500,
    example: 'Gracias por tu comentario.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  response?: string | null;
}

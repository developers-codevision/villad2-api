import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBlogCommentDto {
  @ApiProperty({
    description: 'ID del articulo',
    example: 5,
  })
  @IsNotEmpty()
  @IsInt()
  postId: number;

  @ApiProperty({
    description: 'Nombre del autor del comentario',
    maxLength: 100,
    example: 'Juan Perez',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Contenido del comentario',
    maxLength: 1000,
    example: 'Excelente articulo, gracias por compartir.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}

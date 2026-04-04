import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductFamilyDto {
  @ApiProperty({
    description: 'Nombre de la familia de productos',
    example: 'Bebidas Alcohólicas',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Código prefijado para la familia',
    example: 1000,
  })
  @IsInt()
  code: number;
}

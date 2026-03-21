import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductFamilyDto {
  @ApiProperty({
    description: 'Family name',
    example: 'Bebidas',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Family code prefix',
    example: 1000,
  })
  @IsInt()
  code: number;
}

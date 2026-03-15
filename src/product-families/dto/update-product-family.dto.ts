import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductFamilyDto {
  @ApiPropertyOptional({
    description: 'Family name',
    example: 'Bebidas',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Family code prefix. If you send 1xxx style values (e.g. 1000 or "1xxx"), only the first digit is stored.',
    example: 1,
    minimum: 1,
    maximum: 9,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }

    const normalized = String(value).trim();
    const firstChar = normalized.charAt(0);
    const firstDigit = Number(firstChar);

    return Number.isInteger(firstDigit) ? firstDigit : value;
  })
  @IsInt()
  @Min(1)
  @Max(9)
  code?: number;
}

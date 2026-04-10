import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PromotionStatus } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'Título de la promoción',
    maxLength: 255,
    example: 'Summer Special Package',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Número máximo de personas',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  maxPeople?: number;

  @ApiPropertyOptional({
    description: 'Número mínimo de personas',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  minPeople?: number;

  @ApiPropertyOptional({
    description: 'Duración de la promoción (en horas o días)',
    maxLength: 100,
    example: '7 días',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  time?: string;

  @ApiPropertyOptional({
    description: 'Servicios incluidos en la promoción',
    example: ['desayuno', 'spa', 'tours guiada'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as string[];
        }
      } catch {
        return value.split(',').map((service) => service.trim());
      }
    }
    return value as string[];
  })
  services?: string[];

  @ApiPropertyOptional({
    description: 'Descripción detallada de la promoción',
    example: 'Enjoy our summer special with all meals included',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Hora de check-in',
    maxLength: 10,
    example: '15:00',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  checkInTime?: string;

  @ApiPropertyOptional({
    description: 'Hora de check-out',
    maxLength: 10,
    example: '11:00',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  checkOutTime?: string;

  @ApiPropertyOptional({
    description: 'Ruta de la foto de la promoción',
    example: 'media/promotions/promo1.jpg',
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({
    description: 'Estado de la promoción',
    enum: PromotionStatus,
    default: PromotionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;
}

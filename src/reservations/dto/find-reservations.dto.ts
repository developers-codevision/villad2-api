import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../entities/reservation.entity';

export class FindReservationsDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Campo de ordenamiento', default: 'id' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @ApiPropertyOptional({ description: 'Dirección de ordenamiento', default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Número de reservación' })
  @IsOptional()
  @IsString()
  reservationNumber?: string;

  @ApiPropertyOptional({ description: 'ID de la habitación' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsOptional()
  @IsString()
  clientEmail?: string;

  @ApiPropertyOptional({ description: 'Nombre del cliente' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Estado de la reservación', enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ description: 'Fecha de check-in (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  checkInDateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha de check-in (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  checkInDateTo?: string;

  @ApiPropertyOptional({ description: 'Fecha de check-out (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  checkOutDateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha de check-out (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  checkOutDateTo?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Precio máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Check-in temprano' })
  @IsOptional()
  earlyCheckIn?: boolean;

  @ApiPropertyOptional({ description: 'Check-out tarde' })
  @IsOptional()
  lateCheckOut?: boolean;
}

export class PaginatedReservationsResponse {
  @ApiProperty({ description: 'Lista de reservaciones' })
  reservations: any[];

  @ApiProperty({ description: 'Número total de elementos' })
  total: number;

  @ApiProperty({ description: 'Número de página actual' })
  page: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Número total de páginas' })
  totalPages: number;

  @ApiProperty({ description: 'Hay más páginas' })
  hasNext: boolean;

  @ApiProperty({ description: 'Hay páginas anteriores' })
  hasPrevious: boolean;
}

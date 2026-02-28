import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReservationStatus {
  PENDING = 'pendiente',
  CONFIRMED = 'confirmada',
  CANCELLED = 'cancelada',
  FINISHED = 'terminada',
}

export enum GuestSex {
  M = 'M',
  F = 'F',
  OTHER = 'otro',
}

export enum GuestType {
  BASE = 'base',
  EXTRA = 'extra',
}

export class CreateReservationMainGuestDto {
  @ApiProperty({
    description: 'Main guest (customer) first name',
    example: 'Juan',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Main guest (customer) last name',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description:
      "Main guest (customer) sex (matches DB enum: 'M' | 'F' | 'otro')",
    enum: GuestSex,
    example: GuestSex.M,
  })
  @IsEnum(GuestSex)
  sex: GuestSex;

  @ApiProperty({
    description: 'Main guest (customer) contact email',
    example: 'guest@example.com',
    maxLength: 100,
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Main guest (customer) contact phone number',
    example: '+51987654321',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be a valid international phone number',
  })
  phone: string;
}

export class CreateReservationGuestDto {
  @ApiProperty({
    description: 'Guest first name',
    example: 'Juan',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Guest last name',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: "Guest sex (matches DB enum: 'M' | 'F' | 'otro')",
    enum: GuestSex,
    example: GuestSex.M,
  })
  @IsEnum(GuestSex)
  sex: GuestSex;
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'Room id (habitacion_id)',
    example: 12,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  roomId: number;

  @ApiProperty({
    description: 'Check-in date (fecha_entrada) in ISO format (YYYY-MM-DD)',
    example: '2026-02-21',
  })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({
    description:
      'Check-out date (fecha_salida) in ISO format (YYYY-MM-DD). Must be greater than checkInDate',
    example: '2026-02-23',
  })
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({
    description:
      'Main guest (customer) information. This will be stored in the clients table',
    type: () => CreateReservationMainGuestDto,
  })
  @ValidateNested()
  @Type(() => CreateReservationMainGuestDto)
  mainGuest: CreateReservationMainGuestDto;

  @ApiProperty({
    description: 'Base guests count (cantidad_base). Must be greater than 0',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  baseGuestsCount: number;

  @ApiPropertyOptional({
    description: 'Extra guests count (cantidad_extra). Must be 0 or greater',
    example: 1,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  extraGuestsCount?: number;

  @ApiPropertyOptional({
    description: 'Reservation status (estado). Defaults to pending (pendiente)',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Additional notes (notas)',
    example: 'Late arrival after 10pm',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Additional guests that will be stored as JSON inside the reservation record',
    type: () => [CreateReservationGuestDto],
    maxItems: 200,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => CreateReservationGuestDto)
  additionalGuests?: CreateReservationGuestDto[];

  @ApiPropertyOptional({
    description:
      'Early check-in request (guest wants to check in before standard time)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  earlyCheckIn?: boolean;

  @ApiPropertyOptional({
    description: 'Late check-out request (guest wants to check out after standard time)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  lateCheckOut?: boolean;

  @ApiPropertyOptional({
    description: 'Transfer one way (airport/station to hotel)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  transferOneWay?: boolean;

  @ApiPropertyOptional({
    description: 'Transfer round trip (hotel to airport/station)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  transferRoundTrip?: boolean;

  @ApiPropertyOptional({
    description: 'Number of breakfasts (8 dollars each)',
    example: 2,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  breakfasts?: number;
}

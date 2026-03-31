import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
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
  NO_SHOW = 'no_show',
}

export enum ReservationType {
  ROOM = 'habitacion',
  TERRACE = 'terraza',
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
  @ApiPropertyOptional({
    description: 'Main guest (customer) first name',
    example: 'Juan',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Main guest (customer) last name',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description:
      "Main guest (customer) sex (matches DB enum: 'M' | 'F' | 'otro')",
    enum: GuestSex,
    example: GuestSex.M,
  })
  @IsOptional()
  @IsEnum(GuestSex)
  sex?: GuestSex;

  @ApiPropertyOptional({
    description: 'Main guest (customer) contact email',
    example: 'guest@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({
    description: 'Main guest (customer) contact phone number',
    example: '+51987654321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be a valid international phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Main guest ID number (DNI/passport)',
    example: '12345678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  idNumber?: string;
}

export class CreateReservationGuestDto {
  @ApiPropertyOptional({
    description: 'Guest first name',
    example: 'Juan',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Guest last name',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: "Guest sex (matches DB enum: 'M' | 'F' | 'otro')",
    enum: GuestSex,
    example: GuestSex.M,
  })
  @IsOptional()
  @IsEnum(GuestSex)
  sex?: GuestSex;

  @ApiPropertyOptional({
    description: 'Guest ID number (DNI/passport)',
    example: '12345678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  idNumber?: string;
}

export class CreateReservationDto {
  @ApiPropertyOptional({
    description: 'Room id (habitacion_id)',
    example: 12,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  roomId?: number;

  @ApiPropertyOptional({
    description: 'Check-in datetime (fecha_entrada) in ISO 8601 format (YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ssZ). If earlyCheckIn is true, hour will be adjusted to 12:00',
    example: '2026-02-21T14:00:00',
  })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiPropertyOptional({
    description:
      'Check-out datetime (fecha_salida) in ISO 8601 format (YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ssZ). If lateCheckOut is true, hour will be adjusted to 16:00. Must be greater than checkInDate',
    example: '2026-02-23T11:00:00',
  })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @ApiPropertyOptional({
    description:
      'Main guest (customer) information. This will be stored in the clients table',
    type: () => CreateReservationMainGuestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateReservationMainGuestDto)
  mainGuest?: CreateReservationMainGuestDto;

  @ApiPropertyOptional({
    description: 'Base guests count (cantidad_base). Must be greater than 0',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  baseGuestsCount?: number;

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
    description: 'Observations (observaciones)',
    example: 'Special requests or observations',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  observations?: string;

  @ApiPropertyOptional({
    description:
      'Additional guests that will be stored as JSON inside the reservation record',
    type: () => [CreateReservationGuestDto],
    maxItems: 200,
  })
  @IsOptional()
  @IsArray()
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
    description: 'Number of people for terrace reservation',
    example: 20,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  peopleCount?: number;

  @ApiPropertyOptional({
    description: 'Price for terrace reservation (overrides automatic calculation)',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Total price (can be provided directly for terrace reservations)',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional({
    description: 'Reservation type (tipo). Defaults to room (habitacion)',
    enum: ReservationType,
    example: ReservationType.ROOM,
  })
  @IsOptional()
  @IsEnum(ReservationType)
  type?: ReservationType;

  @ApiPropertyOptional({
    description: 'Number of hours for terrace reservation (suggested: 4)',
    example: 4,
    minimum: 1,
    maximum: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  hoursCount?: number;

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

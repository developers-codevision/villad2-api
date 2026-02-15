import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsPositive,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { RoomType, RoomStatus } from '../enums/room-enums.enum';
export class CreateRoomDto {
  @ApiProperty({
    description: 'Room number/identifier',
    example: 'P-101',
    minLength: 1,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de habitación es requerido' })
  @MinLength(1, { message: 'El número debe tener al menos 1 carácter' })
  @MaxLength(10, { message: 'El número no puede exceder 10 caracteres' })
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'El número solo puede contener letras, números y guiones',
  })
  number: string;
  @ApiProperty({
    description: 'Room name/title',
    example: 'Habitación Familiar Premium',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;
  @ApiProperty({
    description: 'Detailed room description',
    example: 'Amplia habitación con vista al mar...',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(2000, {
    message: 'La descripción no puede exceder 2000 caracteres',
  })
  description: string;
  @ApiProperty({
    description: 'Price per night',
    example: 150.5,
    minimum: 0,
    maximum: 10000,
  })
  @IsNumber()
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  @Min(0, { message: 'El precio mínimo es 0' })
  @Max(10000, { message: 'El precio máximo es 10000' })
  @Type(() => Number)
  pricePerNight: number;
  @ApiProperty({
    description: 'Maximum room capacity',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @IsNumber()
  @IsPositive({ message: 'La capacidad debe ser un número positivo' })
  @Min(1, { message: 'La capacidad mínima es 1 persona' })
  @Max(20, { message: 'La capacidad máxima es 20 personas' })
  @Type(() => Number)
  capacity: number;
  @ApiProperty({
    description: 'Type of the room',
    enum: RoomType,
    example: RoomType.DOUBLE,
  })
  @IsEnum(RoomType, {
    message: 'Tipo de habitación no válido',
  })
  roomType: RoomType;
  @ApiProperty({
    description: 'List of room amenities',
    example: ['TV', 'Minibar', 'Aire acondicionado'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos una comodidad' })
  @ArrayMaxSize(20, { message: 'Máximo 20 comodidades permitidas' })
  @IsString({ each: true, message: 'Cada comodidad debe ser texto' })
  @IsNotEmpty({ each: true, message: 'Las comodidades no pueden estar vacías' })
  roomAmenities: string[];
  @ApiProperty({
    description: 'List of bathroom amenities',
    example: ['Ducha', 'Secador de pelo', 'Artículos de aseo'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1, { message: 'Debe incluir al menos una comodidad de baño' })
  @ArrayMaxSize(15, { message: 'Máximo 15 comodidades de baño permitidas' })
  @IsString({ each: true, message: 'Cada comodidad de baño debe ser texto' })
  bathroomAmenities?: string[];
  @ApiProperty({
    description: 'Current status of the room',
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    required: false,
    default: RoomStatus.AVAILABLE,
  })
  @IsEnum(RoomStatus, { message: 'Estado no válido' })
  @IsOptional()
  status?: RoomStatus;
  @ApiProperty({
    description: 'Main photo of the room (max 10MB each, jpg/jpeg/png)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsNotEmpty({ message: 'La foto principal es requerida' })
  mainPhoto: any;
  @ApiProperty({
    description: 'Additional room photos (max 10MB each, jpg/jpeg/png)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  additionalPhotos?: any[];
  @ApiProperty({
    description: 'Floor number where the room is located',
    example: 1,
    minimum: 0,
    maximum: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'El piso debe ser un número positivo' })
  @Max(50, { message: 'El piso máximo es 50' })
  @Type(() => Number)
  floor?: number;
  // Boolean flags
  @ApiProperty({
    description: 'Indicates if the room has a jacuzzi',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasJacuzzi?: boolean;
  @ApiProperty({
    description: 'Indicates if the room has a TV',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasTv?: boolean;
  @ApiProperty({
    description: 'Indicates if the room has air conditioning',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasAirConditioning?: boolean;
  @ApiProperty({
    description: 'Indicates if the room has heating',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasHeating?: boolean;
  @ApiProperty({
    description: 'Indicates if the room is pet friendly',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPetFriendly?: boolean;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

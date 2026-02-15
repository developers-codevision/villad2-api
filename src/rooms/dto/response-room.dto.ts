import { ApiProperty } from '@nestjs/swagger';
import { RoomType, RoomStatus } from '../enums/room-enums.enum';

export class RoomResponseDto {
  @ApiProperty({ description: 'Unique identifier of the room', example: 1 })
  id: number;

  @ApiProperty({ description: 'Room number/identifier', example: 'P-101' })
  number: string;

  @ApiProperty({
    description: 'Room name/title',
    example: 'Habitación Familiar Premium',
  })
  name: string;

  @ApiProperty({
    description: 'Detailed room description',
    example: 'Amplia habitación con vista al mar...',
  })
  description: string;

  @ApiProperty({
    description: 'Price per night',
    example: 150.5,
    type: Number,
  })
  pricePerNight: number;

  @ApiProperty({
    description: 'Maximum room capacity',
    example: 2,
    type: Number,
  })
  capacity: number;

  @ApiProperty({
    description: 'Type of the room',
    enum: RoomType,
    example: RoomType.DOUBLE,
  })
  roomType: RoomType;

  @ApiProperty({
    description: 'List of room amenities',
    example: ['TV', 'Minibar', 'Aire acondicionado'],
    type: [String],
  })
  roomAmenities: string[];

  @ApiProperty({
    description: 'List of bathroom amenities',
    example: ['Ducha', 'Secador de pelo'],
    type: [String],
    nullable: true,
  })
  bathroomAmenities: string[] | null;

  @ApiProperty({
    description: 'Current status of the room',
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
  })
  status: RoomStatus;

  @ApiProperty({
    description: 'Main photo URLs of the room',
    example: ['https://example.com/room1.jpg'],
    type: [String],
  })
  mainPhoto: string[];

  @ApiProperty({
    description: 'Additional photo URLs of the room',
    example: ['https://example.com/room1-extra1.jpg'],
    type: [String],
    nullable: true,
  })
  additionalPhotos: string[] | null;

  @ApiProperty({
    description: 'Floor number where the room is located',
    example: 1,
    type: Number,
    nullable: true,
  })
  floor: number | null;

  // Boolean flags
  @ApiProperty({
    description: 'Indicates if the room has a jacuzzi',
    example: false,
  })
  hasJacuzzi: boolean;

  @ApiProperty({ description: 'Indicates if the room has a TV', example: true })
  hasTv: boolean;

  @ApiProperty({
    description: 'Indicates if the room has air conditioning',
    example: true,
  })
  hasAirConditioning: boolean;

  @ApiProperty({
    description: 'Indicates if the room has heating',
    example: true,
  })
  hasHeating: boolean;

  @ApiProperty({
    description: 'Indicates if the room is pet friendly',
    example: false,
  })
  isPetFriendly: boolean;

  @ApiProperty({ description: 'Date when the room was created', type: Date })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the room was last updated',
    type: Date,
  })
  updatedAt: Date;

  constructor(partial: Partial<RoomResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RoomListResponseDto {
  @ApiProperty({
    description: 'Array of rooms',
    type: [RoomResponseDto],
  })
  data: RoomResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 10,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(
    data: RoomResponseDto[],
    meta: {
      total: number;
      page: number;
      limit: number;
    },
  ) {
    this.data = data;
    this.meta = {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: Math.ceil(meta.total / meta.limit),
    };
  }
}

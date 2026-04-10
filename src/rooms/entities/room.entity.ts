import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, RoomStatus } from '../enums/room-enums.enum';

@Entity('rooms')
export class Room {
  @ApiProperty({ description: 'ID único de la habitación', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Número de habitación', example: 'P-101' })
  @Column({ unique: true, length: 10 })
  number: string;

  @ApiProperty({ description: 'Nombre de la habitación', example: 'Habitación Familiar Premium' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción detallada de la habitación' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Precio por noche en USD', example: 150.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number;

  @ApiProperty({ description: 'Capacidad base (huéspedes incluidos)', example: 2 })
  @Column({ type: 'int' })
  baseCapacity: number;

  @ApiProperty({ description: 'Capacidad extra (huéspedes adicionales)', example: 1 })
  @Column({ type: 'int' })
  extraCapacity: number;

  @ApiProperty({ description: 'Cargo por huésped extra', example: 25.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  extraGuestCharge: number;

  @ApiProperty({ description: 'Tipo de habitación', enum: RoomType, example: RoomType.STANDARD })
  @Column({ type: 'enum', enum: RoomType, default: RoomType.STANDARD })
  roomType: RoomType;

  @ApiPropertyOptional({ description: 'Lista de comodidades de la habitación', example: ['TV, TV', 'Minibar, Minibar'] })
  @Column({ type: 'json', nullable: true })
  roomAmenities: string[];

  @ApiPropertyOptional({ description: 'Lista de amenidades del baño', example: ['Ducha, Shower', 'Secador, Hair dryer'] })
  @Column({ type: 'json', nullable: true })
  bathroomAmenities: string[];

  @ApiProperty({ description: 'Estado actual de la habitación', enum: RoomStatus, example: RoomStatus.VACIA_LIMPIA })
  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.VACIA_LIMPIA })
  status: RoomStatus;

  @ApiPropertyOptional({ description: 'Fotos principales de la habitación' })
  @Column({ type: 'json', nullable: true })
  mainPhoto: string[];

  @ApiPropertyOptional({ description: 'Fotos adicionales de la habitación' })
  @Column({ type: 'json', nullable: true })
  additionalPhotos: string[];

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

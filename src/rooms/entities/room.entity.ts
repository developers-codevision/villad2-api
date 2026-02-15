import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoomType, RoomStatus } from '../enums/room-enums.enum';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    length: 10,
  })
  number: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  pricePerNight: number;

  @Column({
    type: 'int',
  })
  capacity: number;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.DOUBLE,
  })
  roomType: RoomType;

  // Para MariaDB, es mejor usar JSON en lugar de simple-json
  @Column({
    type: 'json',
    nullable: true,
  })
  roomAmenities: string[];

  @Column({
    type: 'json',
    nullable: true,
  })
  bathroomAmenities: string[];

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  status: RoomStatus;

  @Column({
    type: 'json',
    nullable: true,
  })
  mainPhoto: string[];

  @Column({
    type: 'json',
    nullable: true,
  })
  additionalPhotos: string[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('promotions')
export class Promotion {
  @ApiProperty({
    description: 'Promotion ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Promotion title',
    example: 'Summer Special Package',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Maximum number of people',
    example: 10,
  })
  @Column({ type: 'int', default: 0 })
  maxPeople: number;

  @ApiProperty({
    description: 'Minimum number of people',
    example: 2,
  })
  @Column({ type: 'int', default: 0 })
  minPeople: number;

  @ApiProperty({
    description: 'Duration time (in hours or days)',
    example: '7 days',
  })
  @Column({ type: 'varchar', length: 100, default: '' })
  time: string;

  @ApiProperty({
    description: 'Service included in promotion',
    example: 'All-inclusive package',
  })
  @Column({ type: 'varchar', length: 255, default: '' })
  service: string;

  @ApiProperty({
    description: 'Promotion description',
    example: 'Enjoy our summer special with all meals included',
  })
  @Column({ type: 'text', default: '' })
  description: string;

  @ApiProperty({
    description: 'Check-in time',
    example: '15:00',
  })
  @Column({ type: 'varchar', length: 10, default: '' })
  checkInTime: string;

  @ApiProperty({
    description: 'Check-out time',
    example: '11:00',
  })
  @Column({ type: 'varchar', length: 10, default: '' })
  checkOutTime: string;

  @ApiPropertyOptional({
    description: 'Promotion photo path',
    example: 'media/promotions/promo1.jpg',
  })
  @Column({ type: 'varchar', nullable: true })
  photo?: string;

  @ApiProperty({
    description: 'Promotion status',
    enum: PromotionStatus,
    example: PromotionStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: PromotionStatus,
    default: PromotionStatus.ACTIVE,
  })
  status: PromotionStatus;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

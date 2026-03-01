import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Min, Max } from 'class-validator';

export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('reviews')
export class Review {
  @ApiProperty({
    description: 'Review ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the reviewer',
    example: 'John Doe',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Country of the reviewer',
    example: 'United States',
  })
  @Column({ type: 'varchar', length: 255 })
  country: string;

  @ApiProperty({
    description: 'Review title',
    example: 'Excellent Stay',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Review content',
    example: 'Great experience! The service was excellent.',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: 'Star rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int' })
  @Min(1)
  @Max(5)
  stars: number;

  @ApiPropertyOptional({
    description: 'Response to the review',
    example: 'Thank you for your feedback!',
  })
  @Column({ type: 'text', nullable: true })
  response?: string;

  @ApiProperty({
    description: 'Review status',
    enum: ReviewStatus,
    example: ReviewStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.ACTIVE,
  })
  status: ReviewStatus;

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

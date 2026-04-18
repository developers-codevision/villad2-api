import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BlogStatus {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
}

@Entity('blogs')
export class Blog {
  @ApiProperty({
    description: 'Blog ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Blog title',
    maxLength: 255,
    example: 'Guía completa para visitar La Habana',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    maxLength: 255,
    example: 'guia-completa-para-visitar-la-habana',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ApiPropertyOptional({
    description: 'Short description/summary',
    example: 'Descubre los mejores lugares para visitar en La Habana...',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Full HTML content (sanitized)',
    example: '<h2>Introducción</h2><p>La Habana es una ciudad...</p>',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiPropertyOptional({
    description: 'Featured image path',
    maxLength: 500,
    example: 'media/blog/habana-guide.jpg',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @ApiProperty({
    description: 'Blog status',
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: BlogStatus.HIDDEN,
  })
  status: BlogStatus;

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '2024-01-15',
  })
  @Column({ type: 'date', nullable: true })
  publishedAt?: Date;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

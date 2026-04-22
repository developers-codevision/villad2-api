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
    description: 'Blog title in Spanish',
    maxLength: 255,
    example: 'Guía completa para visitar La Habana',
  })
  @Column({ type: 'varchar', length: 255, name: 'title_es' })
  titleEs: string;

  @ApiProperty({
    description: 'Blog title in English',
    maxLength: 255,
    example: 'Complete guide to visit Havana',
  })
  @Column({ type: 'varchar', length: 255, name: 'title_en' })
  titleEn: string;

  @ApiProperty({
    description: 'URL-friendly slug in Spanish',
    maxLength: 255,
    example: 'guia-completa-para-visitar-la-habana',
  })
  @Column({ type: 'varchar', length: 255, name: 'slug_es', unique: true })
  slugEs: string;

  @ApiProperty({
    description: 'URL-friendly slug in English',
    maxLength: 255,
    example: 'complete-guide-to-visit-havana',
  })
  @Column({ type: 'varchar', length: 255, name: 'slug_en', unique: true })
  slugEn: string;

  @ApiPropertyOptional({
    description: 'Short description/summary in Spanish',
    example: 'Descubre los mejores lugares para visitar en La Habana...',
  })
  @Column({ type: 'text', nullable: true, name: 'description_es' })
  descriptionEs?: string;

  @ApiPropertyOptional({
    description: 'Short description/summary in English',
    example: 'Discover the best places to visit in Havana...',
  })
  @Column({ type: 'text', nullable: true, name: 'description_en' })
  descriptionEn?: string;

  @ApiProperty({
    description: 'Full HTML content in Spanish (sanitized)',
    example: '<h2>Introducción</h2><p>La Habana es una ciudad...</p>',
  })
  @Column({ type: 'text', name: 'content_es' })
  contentEs: string;

  @ApiProperty({
    description: 'Full HTML content in English (sanitized)',
    example: '<h2>Introduction</h2><p>Havana is a city...</p>',
  })
  @Column({ type: 'text', name: 'content_en' })
  contentEn: string;

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

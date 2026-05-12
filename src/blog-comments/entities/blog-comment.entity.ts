import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Blog } from '../../blog/entities/blog.entity';

export enum BlogCommentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('blog_comments')
export class BlogComment {
  @ApiProperty({ description: 'Comment ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Blog post ID', example: 5 })
  @Column({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Blog;

  @ApiProperty({ description: 'Commenter name', example: 'Juan Perez' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Comment content', example: 'Excelente articulo...' })
  @Column({ type: 'text' })
  content: string;

  @ApiPropertyOptional({
    description: 'Admin response',
    example: 'Gracias por tu comentario...',
  })
  @Column({ type: 'text', nullable: true })
  response?: string;

  @ApiProperty({
    description: 'Comment status',
    enum: BlogCommentStatus,
    example: BlogCommentStatus.INACTIVE,
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: BlogCommentStatus.INACTIVE,
  })
  status: BlogCommentStatus;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

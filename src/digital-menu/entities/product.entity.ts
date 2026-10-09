import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CategoryProduct } from './category-product.entity';

@Entity('menu_products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'text', nullable: true, name: 'private_description' })
  privateDescription: string;

  @Column({ type: 'text', nullable: true })
  embedding: string; // JSON float[] from Jina

  @Column({ type: 'varchar', length: 500, nullable: true })
  video: string; // relative URL e.g. /media/menu-videos/167.mp4

  @Column({ type: 'text', nullable: true })
  images: string; // JSON array of relative paths e.g. ["media/menu-images/product-250-x.jpg"]

  @OneToMany(() => CategoryProduct, (cp) => cp.product)
  categoryProducts: CategoryProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

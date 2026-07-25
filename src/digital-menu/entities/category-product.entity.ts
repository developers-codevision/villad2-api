import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('category_product')
export class CategoryProduct {
  @PrimaryColumn({ name: 'category_id' })
  categoryId: number;

  @PrimaryColumn({ name: 'product_id' })
  productId: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Category, (category) => category.categoryProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Product, (product) => product.categoryProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

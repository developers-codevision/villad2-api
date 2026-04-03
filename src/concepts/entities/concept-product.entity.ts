import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Concept } from './concept.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('concept_products')
export class ConceptProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Concept, (concept) => concept.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conceptId' })
  concept: Concept;

  @Column()
  conceptId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity: number;
}

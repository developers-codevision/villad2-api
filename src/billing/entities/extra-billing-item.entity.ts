import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExtraBilling } from './extra-billing.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('extra_billing_items')
export class ExtraBillingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExtraBilling, (extraBilling) => extraBilling.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'extraBillingId' })
  extraBilling: ExtraBilling;

  @Column()
  extraBillingId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  discountedFromInventory: boolean;
}

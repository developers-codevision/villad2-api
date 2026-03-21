import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Billing } from './billing.entity';
import { Concept } from '../../concepts/entities/concept.entity';

@Entity('billing_items')
export class BillingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Billing, (billing) => billing.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingId' })
  billing: Billing;

  @Column()
  billingId: number;

  @ManyToOne(() => Concept)
  @JoinColumn({ name: 'conceptId' })
  concept: Concept;

  @Column()
  conceptId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  // We could store the snapshot of the price at this exact day so historical data isn't corrupted
  // if the Concept changes its canonical price in the future.
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceUsd: number;
}

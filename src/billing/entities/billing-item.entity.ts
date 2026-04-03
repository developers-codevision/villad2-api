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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCup: number;

  @Column({ type: 'boolean', default: false })
  pendingConsumption: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  roomNumber: string;

  @Column({
    type: 'enum',
    enum: ['minibar', 'terraza', 'alojamiento', 'other'],
    default: 'other',
  })
  conceptSource: 'minibar' | 'terraza' | 'alojamiento' | 'other';
}

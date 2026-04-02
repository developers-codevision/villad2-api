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
  totalUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCup: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceUsd: number;

  // Descuento aplicado al item
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'], default: 'fixed' })
  discountType: 'percentage' | 'fixed';

  // Consumo de inventario diferido
  @Column({ type: 'boolean', default: false })
  pendingConsumption: boolean;

  // Número de habitación asociado
  @Column({ type: 'varchar', length: 10, nullable: true })
  roomNumber: string;

  // Origen del concepto (minibar, terraza, alojamiento, other)
  @Column({ type: 'enum', enum: ['minibar', 'terraza', 'alojamiento', 'other'], default: 'other' })
  conceptSource: 'minibar' | 'terraza' | 'alojamiento' | 'other';
}

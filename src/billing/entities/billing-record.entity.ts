import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Billing } from './billing.entity';
import { BillingPayment } from './billing-payment.entity';
import { TipDistribution } from './tip-distribution.entity';
import { Tax10Distribution } from './tax10-distribution.entity';

export interface ConceptConsumption {
  conceptId: number;
  conceptName: string;
  quantityConsumed: number;
}

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overpaid';

@Entity('billing_records')
export class BillingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Billing, (billing) => billing.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingId' })
  billing: Billing;

  @Column()
  billingId: number;

  @Column({ type: 'date' })
  date: string;

  // Total a pagar por los productos
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // Propina
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip: number;

  // 10% del costo (impuesto/servicio)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax10Percent: number;

  // Total general (amount + tip + tax)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grandTotal: number;

  // Estado del pago
  @Column({
    type: 'enum',
    enum: ['pending', 'partial', 'paid', 'overpaid'],
    default: 'pending',
  })
  paymentStatus: PaymentStatus;

  // Lo que falta por pagar
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingAmount: number;

  // Saldo a favor del cliente (anticipo)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  advanceBalance: number;

  // Factura aparcada (no pagada en check-in)
  @Column({ type: 'boolean', default: false })
  isParked: boolean;

  // Consumo de conceptos facturados
  @Column({ type: 'json' })
  conceptConsumptions: ConceptConsumption[];

  // Relaciones
  @OneToMany(() => BillingPayment, (payment) => payment.billingRecord, {
    cascade: true,
  })
  payments: BillingPayment[];

  @OneToMany(() => TipDistribution, (dist) => dist.billingRecord, {
    cascade: true,
  })
  tipDistributions: TipDistribution[];

  @OneToMany(() => Tax10Distribution, (dist) => dist.billingRecord, {
    cascade: true,
  })
  tax10Distributions: Tax10Distribution[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

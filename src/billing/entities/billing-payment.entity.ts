import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BillingRecord } from './billing-record.entity';

export interface BillDenomination {
  value: number;
  quantity: number;
}

export type PaymentMethod =
  | 'cash_usd'
  | 'cash_eur'
  | 'cash_cup'
  | 'transfer_mobile'
  | 'bizum'
  | 'zelle'
  | 'transfer_abroad'
  | 'stripe'
  | 'paypal';

export type Currency = 'USD' | 'EUR' | 'CUP';

@Entity('billing_payments')
export class BillingPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BillingRecord, (record) => record.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingRecordId' })
  billingRecord: BillingRecord;

  @Column()
  billingRecordId: number;

  @Column({
    type: 'enum',
    enum: [
      'cash_usd',
      'cash_eur',
      'cash_cup',
      'transfer_mobile',
      'bizum',
      'zelle',
      'transfer_abroad',
      'stripe',
      'paypal',
    ],
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: ['USD', 'EUR', 'CUP'] })
  currency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountInUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  exchangeRate: number;

  // Desglose de billetes para pagos en efectivo
  @Column({ type: 'json', nullable: true })
  billDenominations: BillDenomination[] | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

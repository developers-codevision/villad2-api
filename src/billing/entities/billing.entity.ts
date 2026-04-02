import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { BillingItem } from './billing-item.entity';
import { BillingRecord } from './billing-record.entity';

@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  date: string; // Fecha de esta hoja de facturación diaria (YYYY-MM-DD)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  usdToCupRate: number; // Tasa de cambio del día (USD -> CUP)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  eurToCupRate: number; // Tasa de cambio del día (EUR -> CUP)

  @OneToMany(() => BillingItem, (item: BillingItem) => item.billing, {
    cascade: true,
  })
  items: BillingItem[];

  @OneToMany(() => BillingRecord, (record: BillingRecord) => record.billing, {
    cascade: true,
  })
  records: BillingRecord[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BillingRecord } from './billing-record.entity';

export interface WorkerDistribution {
  workerId: number;
  workerName: string;
  percentage: number;
  amount: number;
}

@Entity('tax10_distributions')
export class Tax10Distribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BillingRecord, (record) => record.tax10Distributions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingRecordId' })
  billingRecord: BillingRecord;

  @Column()
  billingRecordId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalTax10: number;

  @Column({ type: 'json' })
  distributions: WorkerDistribution[];

  @CreateDateColumn({ type: 'timestamp' })
  distributedAt: Date;
}

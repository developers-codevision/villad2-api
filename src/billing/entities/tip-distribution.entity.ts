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

@Entity('tip_distributions')
export class TipDistribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BillingRecord, (record) => record.tipDistributions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingRecordId' })
  billingRecord: BillingRecord;

  @Column()
  billingRecordId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalTip: number;

  @Column({ type: 'json' })
  distributions: WorkerDistribution[];

  @CreateDateColumn({ type: 'timestamp' })
  distributedAt: Date;
}

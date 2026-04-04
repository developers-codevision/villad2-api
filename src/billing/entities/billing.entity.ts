import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BillingItem } from './billing-item.entity';
import { BillingRecord } from './billing-record.entity';

@Entity('billings')
export class Billing {
  @ApiProperty({ description: 'ID único de la hoja de facturación', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Fecha de la hoja de facturación (YYYY-MM-DD)', example: '2026-04-03' })
  @Column({ type: 'date', unique: true })
  date: string;

  @ApiProperty({ description: 'Tasa de cambio USD a CUP del día', example: 150.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  usdToCupRate: number;

  @ApiProperty({ description: 'Tasa de cambio EUR a CUP del día', example: 160.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  eurToCupRate: number;

  @ApiProperty({ description: 'Lista de items de facturación' })
  @OneToMany(() => BillingItem, (item: BillingItem) => item.billing, {
    cascade: true,
  })
  items: BillingItem[];

  @ApiProperty({ description: 'Lista de registros de facturación' })
  @OneToMany(() => BillingRecord, (record: BillingRecord) => record.billing, {
    cascade: true,
  })
  records: BillingRecord[];

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Billing } from './billing.entity';
import { Concept } from '../../concepts/entities/concept.entity';

@Entity('billing_items')
export class BillingItem {
  @ApiProperty({ description: 'ID único del item de facturación', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Hoja de facturación padre' })
  @ManyToOne(() => Billing, (billing) => billing.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingId' })
  billing: Billing;

  @ApiProperty({ description: 'ID de la hoja de facturación', example: 1 })
  @Column()
  billingId: number;

  @ApiProperty({ description: 'Concepto facturable asociado' })
  @ManyToOne(() => Concept)
  @JoinColumn({ name: 'conceptId' })
  concept: Concept;

  @ApiProperty({ description: 'ID del concepto', example: 1 })
  @Column()
  conceptId: number;

  @ApiProperty({ description: 'Cantidad facturada del concepto', example: 10 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Precio unitario en USD', example: 5.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceUsd: number;

  @ApiProperty({ description: 'Total en USD (cantidad × precio)', example: 50.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalUsd: number;

  @ApiProperty({ description: 'Total en CUP (totalUsd × tasa)', example: 7500.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCup: number;
}

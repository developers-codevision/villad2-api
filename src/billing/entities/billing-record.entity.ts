import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Billing } from './billing.entity';
import { BillingPayment } from './billing-payment.entity';
import { TipDistribution } from './tip-distribution.entity';
import { Tax10Distribution } from './tax10-distribution.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

export interface ProductConsumption {
  productId: number;
  quantityConsumed: number;
}

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overpaid';

@Entity('billing_records')
export class BillingRecord {
  @ApiProperty({ description: 'ID único del registro de facturación', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Hoja de facturación padre' })
  @ManyToOne(() => Billing, (billing) => billing.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingId' })
  billing: Billing;

  @ApiProperty({ description: 'ID de la hoja de facturación', example: 1 })
  @Column()
  billingId: number;

  @ApiPropertyOptional({ description: 'ID de la reservación asociada', example: 1 })
  @Column({ type: 'int', nullable: true })
  reservationId: number | null;

  @ApiPropertyOptional({ description: 'Reservación asociada' })
  @ManyToOne(() => Reservation, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation | null;

  @ApiProperty({ description: 'Fecha del registro', example: '2026-04-03' })
  @Column({ type: 'date' })
  date: string;

  @ApiProperty({ description: 'Total a pagar por los productos', example: 50.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({ description: 'Propina agregada', example: 10.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip: number;

  @ApiProperty({ description: '10% del costo (impuesto servicio)', example: 5.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax10Percent: number;

  @ApiProperty({ description: 'Total general (amount + tip + tax)', example: 65.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grandTotal: number;

  @ApiProperty({ description: 'Estado del pago', enum: ['pending', 'partial', 'paid', 'overpaid'], example: 'paid' })
  @Column({
    type: 'enum',
    enum: ['pending', 'partial', 'paid', 'overpaid'],
    default: 'pending',
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Monto pendiente por pagar', example: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingAmount: number;

  @ApiProperty({ description: 'Saldo a favor del cliente (anticipo)', example: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  advanceBalance: number;

  @ApiProperty({ description: 'Indica si la factura está aparcada', example: false })
  @Column({ type: 'boolean', default: false })
  isParked: boolean;

  @ApiProperty({ description: 'Indica si es facturación diferida (deuda)', example: false })
  @Column({ type: 'boolean', default: false })
  lateBilling: boolean;

  @ApiProperty({ description: 'Indica si hay consumo de inventario pendiente', example: false })
  @Column({ type: 'boolean', default: false })
  pendingConsumption: boolean;

  @ApiPropertyOptional({ description: 'Número de habitación asociada', example: 'P-101' })
  @Column({ type: 'varchar', length: 10, nullable: true })
  roomNumber: string;

  @ApiProperty({ description: 'Origen del concepto facturado', enum: ['minibar', 'terraza', 'alojamiento', 'other'], example: 'other' })
  @Column({
    type: 'enum',
    enum: ['minibar', 'terraza', 'alojamiento', 'other'],
    default: 'other',
  })
  conceptSource: 'minibar' | 'terraza' | 'alojamiento' | 'other';

  @ApiProperty({ description: 'Lista de productos consumidos del inventario' })
  @Column({ type: 'json' })
  productConsumptions: ProductConsumption[];

  @ApiProperty({ description: 'Lista de pagos realizados' })
  @OneToMany(() => BillingPayment, (payment) => payment.billingRecord, {
    cascade: true,
  })
  payments: BillingPayment[];

  @ApiProperty({ description: 'Distribuciones de propinas' })
  @OneToMany(() => TipDistribution, (dist) => dist.billingRecord, {
    cascade: true,
  })
  tipDistributions: TipDistribution[];

  @ApiProperty({ description: 'Distribuciones de impuesto 10%' })
  @OneToMany(() => Tax10Distribution, (dist) => dist.billingRecord, {
    cascade: true,
  })
  tax10Distributions: Tax10Distribution[];

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

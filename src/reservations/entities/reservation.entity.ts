import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { Client } from './client.entity';

export enum ReservationStatus {
  PENDING = 'pendiente',
  CONFIRMED = 'confirmada',
  CANCELLED = 'cancelada',
  FINISHED = 'terminada',
}

export type AdditionalGuest = {
  firstName: string;
  lastName: string;
  sex: 'M' | 'F' | 'otro';
};

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  reservationNumber: string;

  @Column({ type: 'int' })
  roomId: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'int' })
  clientId: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'varchar', length: 19 })
  checkInDate: string;

  @Column({ type: 'varchar', length: 19 })
  checkOutDate: string;

  @CreateDateColumn({ type: 'timestamp' })
  reservedAt: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: 'int' })
  baseGuestsCount: number;

  @Column({ type: 'int', default: 0 })
  extraGuestsCount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'json', nullable: true })
  additionalGuests?: AdditionalGuest[];

  @Column({ type: 'boolean', default: false })
  earlyCheckIn: boolean;

  @Column({ type: 'boolean', default: false })
  lateCheckOut: boolean;

  @Column({ type: 'boolean', default: false })
  transferRoundTrip: boolean;

  @Column({ type: 'boolean', default: false })
  transferOneWay: boolean;

  @Column({ type: 'int', default: 0 })
  breakfasts: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentStatus?: string;

  /**
   * Timestamp at which a PENDING reservation expires if payment is not completed.
   * Set when a PayPal/Stripe order is created. A cron job periodically cancels
   * PENDING reservations whose expiry has passed.
   */
  @Column({ type: 'timestamp', nullable: true })
  paymentExpiresAt?: Date;
}

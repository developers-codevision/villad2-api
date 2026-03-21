import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Room } from '../../rooms/entities/room.entity';

@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unique: true,
  })
  clientNumber: number; // Número (Para saber cantidad de clientes facturados contablemente)

  @Column()
  firstName: string; // Nombre

  @Column()
  lastName: string; // Apellidos

  @Column()
  nationality: string; // Nacionalidad (que permita seleccionarla)

  @Column({ type: 'date', nullable: true })
  birthDate: Date; // Fecha de nacimiento (halarla del check in)

  @Column({ type: 'date' })
  checkInDate: Date; // Fecha de entrada

  @Column({ type: 'date' })
  checkOutDate: Date; // Fecha de salida

  @ManyToOne(() => Room, { eager: true, nullable: true })
  @JoinColumn({ name: 'roomId' })
  room: Room; // Habitación (que permita seleccionarla)

  @Column({ nullable: true })
  roomId: number;

  @Column({ nullable: true })
  immigrationNumber: string; // Inmigración (número de devuelve el casero)

  @Column({ unique: true })
  invoiceNumber: string; // Factura (Número consecutivo registrado en contabilidad)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountCup: number; // Importe Cup (Importe de la factura confeccionada)

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

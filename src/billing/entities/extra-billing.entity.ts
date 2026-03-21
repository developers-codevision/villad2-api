import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { ExtraBillingItem } from './extra-billing-item.entity';

@Entity('extra_billings')
export class ExtraBilling {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ nullable: true })
  roomId: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => ExtraBillingItem, (item: ExtraBillingItem) => item.extraBilling, {
    cascade: true,
  })
  items: ExtraBillingItem[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('vacations')
export class Vacation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => Staff, (staff) => staff.vacations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('absences')
export class Absence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => Staff, (staff) => staff.absences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  reason: string;
}

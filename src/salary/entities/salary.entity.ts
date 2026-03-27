import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('Salary')
export class Salary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => Staff, (staff) => staff.salaries, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment: string;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';
import { Payroll } from '../../payrolls/entities/payroll.entity';

@Entity('salaries')
export class Salary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => Staff, (staff) => staff.salaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ nullable: true })
  payrollId: number;

  @ManyToOne(() => Payroll, (payroll) => payroll.salaries, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payrollId' })
  payroll: Payroll;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment: string;
}

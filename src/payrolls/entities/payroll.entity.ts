import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Salary } from '../../salary/entities/salary.entity';

@Entity('payrolls')
@Index(['month', 'year'], { unique: true })
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @OneToMany(() => Salary, (salary) => salary.payroll)
  salaries: Salary[];
}


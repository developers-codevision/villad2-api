
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DailyAttendance } from '../../daily-attendance/entities/daily-attendance.entity';
import { Salary } from '../../salary/entities/salary.entity';
import { Vacation } from '../../vacation/entities/vacation.entity';
import { Absence } from '../../absence/entities/absence.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  staffname: string;

  @OneToMany(() => DailyAttendance, (dailyAttendance) => dailyAttendance.staff)
  dailyAttendances: DailyAttendance[];

  @OneToMany(() => Salary, (salary) => salary.staff)
  salaries: Salary[];

  @OneToMany(() => Vacation, (vacation) => vacation.staff)
  vacations: Vacation[];

  @OneToMany(() => Absence, (absence) => absence.staff)
  absences: Absence[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DailyAttendance } from '../../daily-attendance/entities/daily-attendance.entity';
import { Salary } from '../../salary/entities/salary.entity';

@Entity('Staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  staffname: string;

  @OneToMany(() => DailyAttendance, (dailyAttendance) => dailyAttendance.staff)
  dailyAttendances: DailyAttendance[];

  @OneToMany(() => Salary, (salary) => salary.staff)
  salaries: Salary[];
}
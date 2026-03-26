
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DailyAttendance } from '../../daily-attendance/entities/daily-attendance.entity';

@Entity('Staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  staffname: string;

  @OneToMany(() => DailyAttendance, (dailyAttendance) => dailyAttendance.staff)
  dailyAttendances: DailyAttendance[];
}
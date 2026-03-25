
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  employeename: string;
}
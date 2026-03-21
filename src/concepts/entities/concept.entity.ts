import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('concepts')
export class Concept {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Concepto

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceUsd: number; // Precio Usd

  @Column({ nullable: true })
  category: string; // Used to group items together like in the excel file

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

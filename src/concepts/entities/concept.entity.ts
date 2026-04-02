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

  @Column({ nullable: true })
  productId: number; // Link to physical product for inventory discount

  @Column({ type: 'boolean', default: true })
  autoConsumeInventory: boolean; // Descargar automáticamente al facturar o manual

  @Column({ type: 'boolean', default: false })
  isActive: boolean; // Soft delete - false = eliminado

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

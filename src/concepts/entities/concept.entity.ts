import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConceptProduct } from './concept-product.entity';

@Entity('concepts')
export class Concept {
  @ApiProperty({ description: 'ID único del concepto', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre del concepto facturable', example: 'Cerveza Cristal 350ml' })
  @Column({ unique: true })
  name: string;

  @ApiPropertyOptional({ description: 'Categoría del concepto', example: 'Bebidas' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Lista de productos que conforman el concepto', type: [ConceptProduct] })
  @OneToMany(() => ConceptProduct, (cp) => cp.concept)
  products: ConceptProduct[];

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

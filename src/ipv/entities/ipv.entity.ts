import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum IpvType {
  COCINA = 'cocina',
  BAR = 'bar',
  MINIBAR = 'minibar',
}

@Entity('ipvs')
export class Ipv {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'enum', enum: IpvType })
  type: IpvType;

  @Column({ nullable: true })
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

  @Column({ type: 'enum', enum: IpvType })
  type: IpvType;

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ type: 'int', nullable: true })
  inital: number;
  
  @Column({ type: 'int', nullable: true })
  final: number;

  @Column({ type: 'int', nullable: true })
  intake: number;

  @Column({ type: 'int', nullable: true })
  decrease: number;

  @Column({ type: 'int', nullable: true })
  bills: number;

  @OneToMany(() => Product, (product) => product.ipv)
  products: Product[];
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductFamily } from '../../product-families/entities/product-family.entity';
import { ProductDailyRecord } from './product-daily-record.entity';
import { Ipv } from '../../ipv/entities/ipv.entity';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'ID único del producto', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Código único del producto', example: 3 })
  @Column({ type: 'int', unique: true })
  code: number;

  @ApiProperty({ description: 'Nombre del producto', example: 'Ron Havana Club 7 Años' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ description: 'Unidad de medida', example: 'botella' })
  @Column({ type: 'varchar', length: 20 })
  unitMeasure: string;

  @ApiProperty({ description: 'Volumen del producto', example: '750ml' })
  @Column({ type: 'varchar', length: 50 })
  volume: string;

  @ApiProperty({ description: 'Precio del producto en USD', example: 25.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiPropertyOptional({ description: 'Familia de productos a la que pertenece' })
  @ManyToOne(() => ProductFamily, { nullable: true })
  @JoinColumn({ name: 'productFamilyId' })
  productFamily?: ProductFamily;

  @ApiPropertyOptional({ description: 'ID de la familia de productos', example: 1 })
  @Column({ type: 'int', nullable: true })
  productFamilyId?: number;

  @ApiPropertyOptional({ description: 'IPV al que pertenece el producto' })
  @ManyToOne(() => Ipv, (ipv) => ipv.products, { nullable: true })
  @JoinColumn({ name: 'ipvId' })
  ipv?: Ipv;

  @ApiPropertyOptional({ description: 'ID del IPV', example: 1 })
  @Column({ type: 'int', nullable: true })
  ipvId?: number;

  @ApiProperty({ description: 'Registros diarios de inventario' })
  @OneToMany(() => ProductDailyRecord, (record) => record.product)
  dailyRecords: ProductDailyRecord[];

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

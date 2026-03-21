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
import { ProductFamily } from '../../product-families/entities/product-family.entity';
import { ProductDailyRecord } from './product-daily-record.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unique: true,
  })
  code: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  unitMeasure: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  volume: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @ManyToOne(() => ProductFamily, { nullable: true })
  @JoinColumn({ name: 'productFamilyId' })
  productFamily?: ProductFamily;

  @Column({
    type: 'int',
    nullable: true,
  })
  productFamilyId?: number;

  @OneToMany(() => ProductDailyRecord, (record) => record.product)
  dailyRecords: ProductDailyRecord[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}

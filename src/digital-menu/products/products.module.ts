import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Category } from '../entities/category.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FileService } from '../../common/files/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, CategoryProduct, Category])],
  controllers: [ProductsController],
  providers: [ProductsService, FileService],
  exports: [ProductsService],
})
export class MenuProductsModule {}

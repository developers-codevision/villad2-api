import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../entities/menu.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Subtitulo } from '../entities/subtitulo.entity';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Category, Product, CategoryProduct, Subtitulo])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductFamiliesService } from './product-families.service';
import { ProductFamiliesController } from './product-families.controller';
import { ProductFamily } from './entities/product-family.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFamily])],
  controllers: [ProductFamiliesController],
  providers: [ProductFamiliesService],
  exports: [ProductFamiliesService],
})
export class ProductFamiliesModule {}

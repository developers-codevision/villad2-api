import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpvService } from './ipv.service';
import { IpvController } from './ipv.controller';
import { Ipv } from './entities/ipv.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ipv, Product])],
  controllers: [IpvController],
  providers: [IpvService],
})
export class IpvModule {}

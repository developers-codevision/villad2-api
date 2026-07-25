import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceConfig } from '../entities/service-config.entity';
import { StaticContentService } from './static-content.service';
import { StaticContentController } from './static-content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceConfig])],
  controllers: [StaticContentController],
  providers: [StaticContentService],
  exports: [StaticContentService],
})
export class StaticContentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuStaticContent } from '../entities/menu-static-content.entity';
import { StaticContentService } from './static-content.service';
import { StaticContentController } from './static-content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuStaticContent])],
  controllers: [StaticContentController],
  providers: [StaticContentService],
  exports: [StaticContentService],
})
export class StaticContentModule {}

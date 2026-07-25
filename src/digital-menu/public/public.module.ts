import { Module } from '@nestjs/common';
import { MenusModule } from '../menus/menus.module';
import { StaticContentModule } from '../static-content/static-content.module';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';

@Module({
  imports: [MenusModule, StaticContentModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}

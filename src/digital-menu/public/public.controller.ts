import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PublicService } from './public.service';
import { MenusService } from '../menus/menus.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly menusService: MenusService,
  ) {}

  @Get('menu')
  async getMenu() {
    return this.publicService.getMenuData();
  }

  @Get('menu/:id')
  async getMenuById(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id, true);
  }
}

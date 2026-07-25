import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('menu')
  async getMenu() {
    return this.publicService.getMenuData();
  }
}

import { Injectable } from '@nestjs/common';
import { MenusService } from '../menus/menus.service';
import { StaticContentService } from '../static-content/static-content.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly menusService: MenusService,
    private readonly staticContentService: StaticContentService,
  ) {}

  async getMenuData() {
    const [menus, staticContent] = await Promise.all([
      this.menusService.findActive(),
      this.staticContentService.getAll(),
    ]);

    return {
      menus,
      staticContent,
      hostalName: process.env.HOSTAL_NAME || 'Hostal',
      hostalLogo: process.env.HOSTAL_LOGO || '/images/logo.png',
      hostalSubdomain: process.env.HOSTAL_SUBDOMAIN || '',
    };
  }
}

import { Injectable } from '@nestjs/common';
import { MenusService } from '../menus/menus.service';
import { StaticContentService } from '../static-content/static-content.service';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class PublicService {
  constructor(
    private readonly menusService: MenusService,
    private readonly staticContentService: StaticContentService,
  ) {}

  /** Quitar campos internos (embedding ~1MB, privateDescription) de la respuesta pública. */
  sanitizeMenu(menu: Menu): Menu {
    for (const cat of menu.categories || []) {
      for (const cp of cat.categoryProducts || []) {
        if (cp.product) {
          delete cp.product.embedding;
          delete cp.product.privateDescription;
        }
      }
    }
    return menu;
  }

  async getMenuData() {
    const [menus, staticContent] = await Promise.all([
      this.menusService.findActive(),
      this.staticContentService.getAll(),
    ]);

    return {
      menus: menus.map((m) => this.sanitizeMenu(m)),
      staticContent,
      hostalName: process.env.HOSTAL_NAME || 'Hostal',
    };
  }
}

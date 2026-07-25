import { Controller, Get, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('login')
  loginPage(@Res() res: Response) {
    res.render('admin/login', { layout: false });
  }

  @Get()
  dashboardPage(@Res() res: Response) {
    const data = this.adminService.getDashboardData();
    res.render('admin/dashboard/index', data);
  }

  @Get('menus')
  menusPage(@Res() res: Response) {
    res.render('admin/menus/index');
  }

  @Get('menus/create')
  menuCreatePage(@Res() res: Response) {
    res.render('admin/menus/create');
  }

  @Get('menus/:id/edit')
  menuEditPage(@Res() res: Response) {
    res.render('admin/menus/edit');
  }

  @Get('categories')
  categoriesPage(@Res() res: Response) {
    res.render('admin/categories/index');
  }

  @Get('categories/create')
  categoryCreatePage(@Res() res: Response) {
    res.render('admin/categories/create');
  }

  @Get('categories/:id/edit')
  categoryEditPage(@Res() res: Response) {
    res.render('admin/categories/edit');
  }

  @Get('products')
  productsPage(@Res() res: Response) {
    res.render('admin/products/index');
  }

  @Get('products/create')
  productCreatePage(@Res() res: Response) {
    res.render('admin/products/create');
  }

  @Get('products/:id/edit')
  productEditPage(@Res() res: Response) {
    res.render('admin/products/edit');
  }

  @Get('static-content')
  staticContentPage(@Res() res: Response) {
    res.render('admin/static-content/index');
  }
}

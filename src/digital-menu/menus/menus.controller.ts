import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuFullDto, UpdateMenuFullDto } from './dto/menu-nested.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    return this.menusService.findAll(isActive === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Query('isActive') isActive?: string) {
    return this.menusService.findOne(id, isActive === 'true');
  }

  @Post()
  create(@Body() dto: CreateMenuFullDto) {
    return this.menusService.createFull(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuFullDto) {
    return this.menusService.updateFull(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }
}

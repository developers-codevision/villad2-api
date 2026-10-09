import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { multerMenuVideoOptions } from '../../config/multer-menu-videos.config';

@Controller('api/menu-categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('menu/:menuId')
  findByMenu(@Param('menuId', ParseIntPipe) menuId: number) {
    return this.categoriesService.findByMenu(menuId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  @Post(':id/video')
  @UseInterceptors(FileInterceptor('video', multerMenuVideoOptions('category')))
  uploadVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Archivo de video requerido');
    return this.categoriesService.setVideo(id, `media/menu-videos/${file.filename}`);
  }

  @Delete(':id/video')
  removeVideo(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.clearVideo(id);
  }
}

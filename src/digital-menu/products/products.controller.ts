import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { multerMenuVideoOptions } from '../../config/multer-menu-videos.config';
import { multerMenuImageOptions } from '../../config/multer-menu-images.config';

@Controller('api/menu-products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Post(':id/video')
  @UseInterceptors(FileInterceptor('video', multerMenuVideoOptions('product')))
  uploadVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Archivo de video requerido');
    return this.productsService.setVideo(id, `media/menu-videos/${file.filename}`);
  }

  @Delete(':id/video')
  removeVideo(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.clearVideo(id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 12, multerMenuImageOptions()))
  uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('Archivos de imagen requeridos');
    return this.productsService.addImages(
      id,
      files.map((f) => `media/menu-images/${f.filename}`),
    );
  }

  @Delete(':id/images')
  removeImage(@Param('id', ParseIntPipe) id: number, @Query('path') path?: string) {
    if (!path) throw new BadRequestException('Query param "path" requerido');
    return this.productsService.removeImage(id, path);
  }
}

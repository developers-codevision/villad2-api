import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileService } from '../../common/files/file.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly fileService: FileService,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { order: 'ASC' },
      relations: ['menu'],
    });
  }

  async findByMenu(menuId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { menuId, active: true },
      order: { order: 'ASC' },
      relations: ['categoryProducts', 'categoryProducts.product'],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['menu', 'categoryProducts', 'categoryProducts.product'],
    });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.save(dto as any);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async setVideo(id: number, video: string): Promise<Category> {
    const category = await this.findOne(id);
    if (category.video && category.video !== video) {
      await this.fileService.deleteFile(category.video);
    }
    category.video = video;
    await this.categoryRepository.save(category);
    return this.findOne(id);
  }

  async clearVideo(id: number): Promise<Category> {
    const category = await this.findOne(id);
    if (category.video) {
      await this.fileService.deleteFile(category.video);
      category.video = null;
      await this.categoryRepository.save(category);
    }
    return this.findOne(id);
  }
}

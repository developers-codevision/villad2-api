import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from '../entities/menu-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly categoryRepository: Repository<MenuCategory>,
  ) {}

  async findAll(): Promise<MenuCategory[]> {
    return this.categoryRepository.find({
      order: { order: 'ASC' },
      relations: ['menu', 'products'],
    });
  }

  async findByMenu(menuId: number): Promise<MenuCategory[]> {
    return this.categoryRepository.find({
      where: { menuId, active: true },
      order: { order: 'ASC' },
      relations: ['products'],
    });
  }

  async findOne(id: number): Promise<MenuCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['menu', 'products'],
    });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<MenuCategory> {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<MenuCategory> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}

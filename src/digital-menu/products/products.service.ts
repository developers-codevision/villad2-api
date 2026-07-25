import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuProduct } from '../entities/menu-product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(MenuProduct)
    private readonly productRepository: Repository<MenuProduct>,
  ) {}

  async findAll(): Promise<MenuProduct[]> {
    return this.productRepository.find({
      order: { name: 'ASC' },
      relations: ['menu', 'category'],
    });
  }

  async findOne(id: number): Promise<MenuProduct> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['menu', 'category'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async findByMenu(menuId: number): Promise<MenuProduct[]> {
    return this.productRepository.find({
      where: { menuId, active: true },
      order: { name: 'ASC' },
      relations: ['category'],
    });
  }

  async findByCategory(categoryId: number): Promise<MenuProduct[]> {
    return this.productRepository.find({
      where: { categoryId, active: true },
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateProductDto): Promise<MenuProduct> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<MenuProduct> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}

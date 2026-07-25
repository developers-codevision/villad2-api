import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Category } from '../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CategoryProduct)
    private readonly cpRepository: Repository<CategoryProduct>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      order: { name: 'ASC' },
      relations: ['categoryProducts', 'categoryProducts.category', 'categoryProducts.category.menu'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categoryProducts', 'categoryProducts.category', 'categoryProducts.category.menu'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async findByMenu(menuId: number): Promise<Product[]> {
    const cpEntries = await this.cpRepository.find({
      where: { category: { menuId } },
      relations: ['product', 'category'],
    });
    return cpEntries.map((cp) => cp.product);
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    const cpEntries = await this.cpRepository.find({
      where: { categoryId },
      order: { order: 'ASC' },
      relations: ['product'],
    });
    return cpEntries.map((cp) => cp.product);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const { categoryIds, ...productData } = dto;
    const product = this.productRepository.create(productData);
    const saved = await this.productRepository.save(product);

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
      for (const cat of categories) {
        await this.cpRepository.save(this.cpRepository.create({ categoryId: cat.id, productId: saved.id }));
      }
    }

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const { categoryIds, ...productData } = dto;
    const product = await this.findOne(id);
    Object.assign(product, productData);
    await this.productRepository.save(product);

    if (categoryIds !== undefined) {
      await this.cpRepository.delete({ productId: id });
      if (categoryIds.length > 0) {
        const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
        for (const cat of categories) {
          await this.cpRepository.save(this.cpRepository.create({ categoryId: cat.id, productId: id }));
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}

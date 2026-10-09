import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Category } from '../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../../common/files/file.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private embeddingService: any = null;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CategoryProduct)
    private readonly cpRepository: Repository<CategoryProduct>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly fileService: FileService,
  ) {}

  // Lazy inject to avoid circular dependency
  setEmbeddingService(service: any) {
    this.embeddingService = service;
  }

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

    const result = await this.findOne(saved.id);

    // Auto-embed async (fire and forget)
    this.embedProduct(result).catch((err) =>
      this.logger.error(`Auto-embed failed for product ${saved.id}: ${err.message}`),
    );

    return result;
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

    const result = await this.findOne(id);

    // Re-embed async (fire and forget)
    this.embedProduct(result).catch((err) =>
      this.logger.error(`Auto-embed failed for product ${id}: ${err.message}`),
    );

    return result;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    for (const img of this.parseImages(product.images)) {
      await this.fileService.deleteFile(img.replace(/^\//, ''));
    }
    await this.productRepository.remove(product);
  }

  private async embedProduct(product: Product): Promise<void> {
    if (!this.embeddingService) return;
    const cat = product.categoryProducts?.[0]?.category;
    const menu = cat?.menu;
    await this.embeddingService.embedProduct(product, cat?.name, menu?.name);
  }

  async setVideo(id: number, video: string): Promise<Product> {
    const product = await this.findOne(id);
    if (product.video && product.video !== video) {
      await this.fileService.deleteFile(product.video);
    }
    product.video = video;
    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async clearVideo(id: number): Promise<Product> {
    const product = await this.findOne(id);
    if (product.video) {
      await this.fileService.deleteFile(product.video);
      product.video = null;
      await this.productRepository.save(product);
    }
    return this.findOne(id);
  }

  private parseImages(raw: string | null): string[] {
    if (!raw) return [];
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  async addImages(id: number, paths: string[]): Promise<Product> {
    const product = await this.findOne(id);
    const current = this.parseImages(product.images);
    if (current.length + paths.length > 12) {
      throw new BadRequestException('Máximo 12 imágenes por producto');
    }
    product.images = JSON.stringify([...current, ...paths]);
    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async removeImage(id: number, imagePath: string): Promise<Product> {
    // Guard: only allow deletion inside media/menu-images/
    const normalized = imagePath.replace(/^\//, '');
    if (!normalized.startsWith('media/menu-images/') || normalized.includes('..')) {
      throw new BadRequestException('Ruta de imagen inválida');
    }
    const product = await this.findOne(id);
    const current = this.parseImages(product.images);
    if (!current.includes(imagePath) && !current.includes(normalized)) {
      throw new NotFoundException('Imagen no encontrada en este producto');
    }
    product.images = JSON.stringify(
      current.filter((p) => p !== imagePath && p !== normalized),
    );
    await this.productRepository.save(product);
    await this.fileService.deleteFile(normalized);
    return this.findOne(id);
  }
}

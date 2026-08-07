import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Subtitulo } from '../entities/subtitulo.entity';
import { NestedCategoryDto, NestedProductDto, NestedSubtituloDto, CreateMenuFullDto, UpdateMenuFullDto } from './dto/menu-nested.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CategoryProduct)
    private readonly cpRepository: Repository<CategoryProduct>,
    @InjectRepository(Subtitulo)
    private readonly subtituloRepository: Repository<Subtitulo>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(onlyActive = false): Promise<Menu[]> {
    const where: any = onlyActive ? { active: true } : {};
    return this.menuRepository.find({
      select: ['id', 'name', 'schedule', 'description', 'order', 'active'],
      where,
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number, onlyActive = false): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: [
        'categories',
        'categories.categoryProducts',
        'categories.categoryProducts.product',
        'subtitulos',
      ],
    });
    if (!menu) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    if (onlyActive) {
      menu.categories = menu.categories?.filter(c => c.active) || [];
      for (const cat of menu.categories) {
        cat.categoryProducts = cat.categoryProducts?.filter(cp => cp.product?.active) || [];
      }
    }

    menu.categories?.sort((a, b) => a.order - b.order);
    for (const cat of menu.categories || []) {
      cat.categoryProducts?.sort((a, b) => a.order - b.order);
    }
    menu.subtitulos?.sort((a, b) => a.order - b.order);

    return menu;
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }

  async findActive(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      where: { active: true },
      order: { order: 'ASC' },
      relations: [
        'categories',
        'categories.categoryProducts',
        'categories.categoryProducts.product',
        'subtitulos',
      ],
    });

    for (const menu of menus) {
      menu.categories = menu.categories?.filter(c => c.active) || [];
      for (const cat of menu.categories) {
        cat.categoryProducts = cat.categoryProducts?.filter(cp => cp.product?.active) || [];
      }
      menu.categories?.sort((a, b) => a.order - b.order);
      for (const cat of menu.categories || []) {
        cat.categoryProducts?.sort((a, b) => a.order - b.order);
      }
      menu.subtitulos?.sort((a, b) => a.order - b.order);
    }

    return menus;
  }

  async createFull(dto: CreateMenuFullDto): Promise<Menu> {
    this.validateNoDuplicateOrders(dto.categories as any, dto.subtitulos as any);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menu = await queryRunner.manager.save(Menu, {
        name: dto.name,
        description: dto.description,
        schedule: dto.schedule,
        order: dto.order,
        active: dto.active,
      } as any);

      if (dto.categories) {
        for (const catDto of dto.categories) {
          const category = await queryRunner.manager.save(Category, {
            name: catDto.name,
            description: catDto.description,
            active: catDto.active,
            order: catDto.order,
            price: catDto.price,
            menuId: menu.id,
          });

          if (catDto.products) {
            for (const prodDto of catDto.products) {
              const product = await queryRunner.manager.save(Product, {
                name: prodDto.name,
                description: prodDto.description,
                price: prodDto.price,
                active: prodDto.active,
                featured: prodDto.featured,
              } as any);

              await queryRunner.manager.save(CategoryProduct, {
                categoryId: category.id,
                productId: product.id,
                order: prodDto.order ?? 0,
              });
            }
          }
        }
      }

      if (dto.subtitulos) {
        for (const subDto of dto.subtitulos) {
          await queryRunner.manager.save(Subtitulo, {
            menuId: menu.id,
            text: subDto.text,
            order: subDto.order,
          });
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(menu.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateFull(id: number, dto: UpdateMenuFullDto): Promise<Menu> {
    this.validateNoDuplicateOrders(dto.categories as any, dto.subtitulos as any);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menu = await queryRunner.manager.findOne(Menu, {
        where: { id },
        relations: ['categories', 'categories.categoryProducts', 'subtitulos'],
      });

      if (!menu) {
        throw new NotFoundException(`Menú con ID ${id} no encontrado`);
      }

      if (dto.name !== undefined) menu.name = dto.name;
      if (dto.description !== undefined) menu.description = dto.description;
      if (dto.schedule !== undefined) menu.schedule = dto.schedule;
      if (dto.order !== undefined) menu.order = dto.order;
      if (dto.active !== undefined) menu.active = dto.active;
      await queryRunner.manager.save(Menu, menu);

      if (dto.categories !== undefined) {
        const existingCategoryIds = menu.categories.map(c => c.id);
        const incomingCategoryIds = dto.categories.filter(c => c.id).map(c => c.id);
        const categoriesToDeleteIds = existingCategoryIds.filter(cid => !incomingCategoryIds.includes(cid));

        for (const catId of categoriesToDeleteIds) {
          const category = await queryRunner.manager.findOne(Category, {
            where: { id: catId },
            relations: ['categoryProducts'],
          });

          if (category) {
            const productIdsInCategory = category.categoryProducts.map(cp => cp.productId);
            await queryRunner.manager.remove(Category, category);

            for (const productId of productIdsInCategory) {
              const remainingCp = await queryRunner.manager.find(CategoryProduct, { where: { productId } });
              if (remainingCp.length === 0) {
                await queryRunner.manager.delete(Product, productId);
              }
            }
          }
        }

        for (const catDto of dto.categories) {
          let category: Category;

          if (catDto.id) {
            const found = await queryRunner.manager.findOne(Category, { where: { id: catDto.id } });
            if (!found) {
              throw new NotFoundException(`Categoría con ID ${catDto.id} no encontrada`);
            }
            category = found;

            if (catDto.name !== undefined) category.name = catDto.name;
            if (catDto.description !== undefined) category.description = catDto.description;
            if (catDto.active !== undefined) category.active = catDto.active;
            if (catDto.order !== undefined) category.order = catDto.order;
            if (catDto.price !== undefined) category.price = catDto.price;
            await queryRunner.manager.save(Category, category);
          } else {
            category = await queryRunner.manager.save(Category, {
              name: catDto.name,
              description: catDto.description,
              active: catDto.active,
              order: catDto.order,
              price: catDto.price,
              menuId: menu.id,
            });
          }

          if (catDto.products !== undefined) {
            await this.syncCategoryProducts(queryRunner, category.id, catDto.products);
          }
        }
      }

      if (dto.subtitulos !== undefined) {
        await this.syncSubtitulos(queryRunner, menu.id, dto.subtitulos);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async syncCategoryProducts(queryRunner: any, categoryId: number, incomingProducts: NestedProductDto[]): Promise<void> {
    const existingCps = await queryRunner.manager.find(CategoryProduct, { where: { categoryId } });
    const existingProductIds = existingCps.map(cp => cp.productId);
    const incomingProductIds = incomingProducts.filter(p => p.id).map(p => p.id);

    const productIdsToRemove = existingProductIds.filter(pid => !incomingProductIds.includes(pid));

    for (const productId of productIdsToRemove) {
      await queryRunner.manager.delete(CategoryProduct, { categoryId, productId });
      const remainingCp = await queryRunner.manager.find(CategoryProduct, { where: { productId } });
      if (remainingCp.length === 0) {
        await queryRunner.manager.delete(Product, productId);
      }
    }

    for (const prodDto of incomingProducts) {
      let product: Product;

      if (prodDto.id) {
        const foundProduct = await queryRunner.manager.findOne(Product, { where: { id: prodDto.id } });
        if (!foundProduct) {
          throw new NotFoundException(`Producto con ID ${prodDto.id} no encontrado`);
        }
        product = foundProduct;

        if (prodDto.name !== undefined) product.name = prodDto.name;
        if (prodDto.description !== undefined) product.description = prodDto.description;
        if (prodDto.price !== undefined) product.price = prodDto.price;
        if (prodDto.active !== undefined) product.active = prodDto.active;
        if (prodDto.featured !== undefined) product.featured = prodDto.featured;
        await queryRunner.manager.save(Product, product);

        const existingCp = await queryRunner.manager.findOne(CategoryProduct, { where: { categoryId, productId: product.id } });
        if (existingCp) {
          existingCp.order = prodDto.order ?? existingCp.order;
          await queryRunner.manager.save(CategoryProduct, existingCp);
        } else {
          await queryRunner.manager.save(CategoryProduct, { categoryId, productId: product.id, order: prodDto.order ?? 0 });
        }
      } else {
        product = await queryRunner.manager.save(Product, {
          name: prodDto.name,
          description: prodDto.description,
          price: prodDto.price,
          active: prodDto.active,
          featured: prodDto.featured,
        } as any);

        await queryRunner.manager.save(CategoryProduct, { categoryId, productId: product.id, order: prodDto.order ?? 0 });
      }
    }
  }

  private async syncSubtitulos(queryRunner: any, menuId: number, incomingSubtitulos: NestedSubtituloDto[]): Promise<void> {
    const existingSubtitulos = await queryRunner.manager.find(Subtitulo, { where: { menuId } });
    const existingIds = existingSubtitulos.map(s => s.id);
    const incomingIds = incomingSubtitulos.filter(s => s.id).map(s => s.id);

    const idsToDelete = existingIds.filter(sid => !incomingIds.includes(sid));
    if (idsToDelete.length > 0) {
      await queryRunner.manager.delete(Subtitulo, { id: In(idsToDelete) });
    }

    for (const subDto of incomingSubtitulos) {
      if (subDto.id) {
        const sub = await queryRunner.manager.findOne(Subtitulo, { where: { id: subDto.id } });
        if (sub) {
          if (subDto.text !== undefined) sub.text = subDto.text;
          if (subDto.order !== undefined) sub.order = subDto.order;
          await queryRunner.manager.save(Subtitulo, sub);
        }
      } else {
        await queryRunner.manager.save(Subtitulo, { menuId, text: subDto.text, order: subDto.order });
      }
    }
  }

  private validateNoDuplicateOrders(categories: NestedCategoryDto[] | undefined, subtitulos: NestedSubtituloDto[] | undefined): void {
    if (categories) {
      const catOrders = categories.map(c => c.order || 0);
      const dupCat = catOrders.filter((o, i) => catOrders.indexOf(o) !== i);
      if (dupCat.length > 0) {
        throw new BadRequestException(`Órdenes de categorías duplicados: ${[...new Set(dupCat)].join(', ')}`);
      }
      for (const cat of categories) {
        if (cat.products && cat.products.length > 0) {
          const prodOrders = cat.products.map(p => p.order ?? 0);
          const dupProd = prodOrders.filter((o, i) => prodOrders.indexOf(o) !== i);
          if (dupProd.length > 0) {
            throw new BadRequestException(`Órdenes de productos duplicados en categoría "${cat.name}": ${[...new Set(dupProd)].join(', ')}`);
          }
        }
      }
    }
    if (subtitulos) {
      const subOrders = subtitulos.map(s => s.order || 0);
      const dupSub = subOrders.filter((o, i) => subOrders.indexOf(o) !== i);
      if (dupSub.length > 0) {
        throw new BadRequestException(`Órdenes de subtítulos duplicados: ${[...new Set(dupSub)].join(', ')}`);
      }
    }
  }
}

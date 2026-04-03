import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductFamily } from './entities/product-family.entity';
import { CreateProductFamilyDto } from './dto/create-product-family.dto';
import { UpdateProductFamilyDto } from './dto/update-product-family.dto';

@Injectable()
export class ProductFamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private readonly productFamilyRepository: Repository<ProductFamily>,
  ) {}

  async create(
    createProductFamilyDto: CreateProductFamilyDto,
  ): Promise<ProductFamily> {
    const existingByName = await this.productFamilyRepository.findOne({
      where: { name: createProductFamilyDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Product family name "${createProductFamilyDto.name}" already exists`,
      );
    }

    const existingByCode = await this.productFamilyRepository.findOne({
      where: { code: createProductFamilyDto.code },
    });

    if (existingByCode) {
      throw new ConflictException(
        `Product family code "${createProductFamilyDto.code}" already exists`,
      );
    }

    const productFamily = this.productFamilyRepository.create(
      createProductFamilyDto,
    );
    return this.productFamilyRepository.save(productFamily);
  }

  async findAll(): Promise<ProductFamily[]> {
    return this.productFamilyRepository.find({
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ProductFamily> {
    const productFamily = await this.productFamilyRepository.findOne({
      where: { id },
    });

    if (!productFamily) {
      throw new NotFoundException(`Product family with id ${id} not found`);
    }

    return productFamily;
  }

  async update(
    id: number,
    updateProductFamilyDto: UpdateProductFamilyDto,
  ): Promise<ProductFamily> {
    const productFamily = await this.findOne(id);

    if (
      updateProductFamilyDto.name !== undefined &&
      updateProductFamilyDto.name !== productFamily.name
    ) {
      const existingByName = await this.productFamilyRepository.findOne({
        where: { name: updateProductFamilyDto.name },
      });

      if (existingByName) {
        throw new ConflictException(
          `Product family name "${updateProductFamilyDto.name}" already exists`,
        );
      }
    }

    if (
      updateProductFamilyDto.code !== undefined &&
      updateProductFamilyDto.code !== productFamily.code
    ) {
      const existingByCode = await this.productFamilyRepository.findOne({
        where: { code: updateProductFamilyDto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          `Product family code "${updateProductFamilyDto.code}" already exists`,
        );
      }
    }

    Object.assign(productFamily, updateProductFamilyDto);
    return this.productFamilyRepository.save(productFamily);
  }

  async remove(id: number): Promise<void> {
    const productFamily = await this.findOne(id);
    await this.productFamilyRepository.remove(productFamily);
  }
}

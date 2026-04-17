import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIpvDto } from './dto/create-ipv.dto';
import { UpdateIpvDto } from './dto/update-ipv.dto';
import { Ipv } from './entities/ipv.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class IpvService {
  constructor(
    @InjectRepository(Ipv)
    private readonly ipvRepository: Repository<Ipv>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createIpvDto: CreateIpvDto) {
    const existingCode = await this.ipvRepository.findOne({
      where: { code: createIpvDto.code },
    });

    if (existingCode) {
      throw new ConflictException(`Ya existe un IPV con el código '${createIpvDto.code}'`);
    }

    if (createIpvDto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: createIpvDto.productId },
      });

      if (!product) {
        throw new NotFoundException(`El producto con id ${createIpvDto.productId} no existe`);
      }

      const existingIpv = await this.ipvRepository.findOne({
        where: {
          productId: createIpvDto.productId,
          type: createIpvDto.type,
        },
      });

      if (existingIpv) {
        throw new ConflictException(`Ya existe un IPV de tipo '${createIpvDto.type}' para este producto`);
      }
    }

    const newIpv = this.ipvRepository.create(createIpvDto);
    return await this.ipvRepository.save(newIpv);
  }

  async findAll() {
    return await this.ipvRepository.find({ relations: ['product'] });
  }

  async findOne(id: number) {
    const ipv = await this.ipvRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!ipv) {
      throw new NotFoundException(`IPV con id ${id} no encontrado`);
    }

    return ipv;
  }

  async update(id: number, updateIpvDto: UpdateIpvDto) {
    const ipv = await this.findOne(id);

    if (updateIpvDto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateIpvDto.productId },
      });
      if (!product) {
        throw new NotFoundException(`El producto con id ${updateIpvDto.productId} no existe`);
      }
    }

    const nextType = updateIpvDto.type ?? ipv.type;
    const nextCode = updateIpvDto.code ?? ipv.code;
    const nextProductId = updateIpvDto.productId !== undefined ? updateIpvDto.productId : ipv.productId;

    if (nextCode !== ipv.code) {
      const existingCode = await this.ipvRepository.findOne({
        where: { code: nextCode },
      });

      if (existingCode && existingCode.id !== ipv.id) {
        throw new ConflictException(`Ya existe un IPV con el código '${nextCode}'`);
      }
    }

    if ((nextType !== ipv.type || nextProductId !== ipv.productId) && nextProductId) {
      const existingIpv = await this.ipvRepository.findOne({
        where: { type: nextType, productId: nextProductId },
      });

      if (existingIpv && existingIpv.id !== ipv.id) {
        throw new ConflictException(
          `Ya existe un IPV de tipo '${nextType}' para el producto con id ${nextProductId}`,
        );
      }
    }

    this.ipvRepository.merge(ipv, updateIpvDto);
    return await this.ipvRepository.save(ipv);
  }

  async remove(id: number) {
    const ipv = await this.findOne(id);
    await this.ipvRepository.remove(ipv);
    return { message: 'IPV eliminado exitosamente', id };
  }
}

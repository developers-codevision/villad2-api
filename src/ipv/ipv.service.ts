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
  ) {}

  async create(createIpvDto: CreateIpvDto) {
    // Buscamos el registro IPV anterior del mismo tipo para obtener su 'final'
    const previousIpv = await this.ipvRepository.findOne({
      where: { type: createIpvDto.type },
      order: { id: 'DESC' },
    });

    // El inicial es el final del día anterior (o 0 si es el primer registro)
    const initial = previousIpv?.final || 0;

    // Tomamos los valores del DTO (asumiendo 0 si no se envían)
    const intake = createIpvDto.intake || 0;
    const bills = createIpvDto.bills || 0; // Asumiendo que bills representa el "consumo"
    const decrease = createIpvDto.decrease || 0;

    // Lógica calculada: inicial + entrada + consumo - merma
    const final = initial + intake + bills - decrease;

    const newIpv = this.ipvRepository.create({
      ...createIpvDto,
      inital: initial,
      final: final,
    });
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
    const nextType = updateIpvDto.type ?? ipv.type;
    this.ipvRepository.merge(ipv, updateIpvDto);
    return await this.ipvRepository.save(ipv);
  }

  async remove(id: number) {
    const ipv = await this.findOne(id);
    await this.ipvRepository.remove(ipv);
    return { message: 'IPV eliminado exitosamente', id };
  }
}

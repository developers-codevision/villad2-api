import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { FindClientsDto } from './dto/find-clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async findAll(findClientsDto: FindClientsDto): Promise<{
    clients: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const {
      page = 1,
      limit = 10,
      idNumber,
      firstName,
      lastName,
      email,
      phone,
    } = findClientsDto;

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .orderBy('client.id', 'DESC');

    if (idNumber) {
      queryBuilder.andWhere('client.idNumber LIKE :idNumber', {
        idNumber: `%${idNumber}%`,
      });
    }

    if (firstName) {
      queryBuilder.andWhere('client.firstName LIKE :firstName', {
        firstName: `%${firstName}%`,
      });
    }

    if (lastName) {
      queryBuilder.andWhere('client.lastName LIKE :lastName', {
        lastName: `%${lastName}%`,
      });
    }

    if (email) {
      queryBuilder.andWhere('client.email LIKE :email', {
        email: `%${email}%`,
      });
    }

    if (phone) {
      queryBuilder.andWhere('client.phone LIKE :phone', {
        phone: `%${phone}%`,
      });
    }

    const total = await queryBuilder.getCount();

    const offset = (page - 1) * limit;
    const clients = await queryBuilder.skip(offset).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      clients,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrevious,
    };
  }

  async findOne(idNumber: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { idNumber } });
    if (!client) {
      throw new Error(`Client with idNumber ${idNumber} not found`);
    }
    return client;
  }
}

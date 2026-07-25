import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceConfig } from '../entities/service-config.entity';

@Injectable()
export class StaticContentService {
  constructor(
    @InjectRepository(ServiceConfig)
    private readonly repo: Repository<ServiceConfig>,
  ) {}

  async get(key: string): Promise<string> {
    const content = await this.repo.findOne({ where: { key } });
    return content?.value || '';
  }

  async getAll(): Promise<Record<string, string>> {
    const contents = await this.repo.find();
    const result: Record<string, string> = {};
    for (const c of contents) {
      result[c.key] = c.value;
    }
    return result;
  }

  async set(key: string, value: string): Promise<ServiceConfig> {
    let content = await this.repo.findOne({ where: { key } });
    if (content) {
      content.value = value;
    } else {
      content = this.repo.create({ key, value });
    }
    return this.repo.save(content);
  }
}

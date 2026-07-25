import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuStaticContent } from '../entities/menu-static-content.entity';

export type StaticContentKey = 'service_hours' | 'intro_text' | 'footer_text';

@Injectable()
export class StaticContentService {
  constructor(
    @InjectRepository(MenuStaticContent)
    private readonly repo: Repository<MenuStaticContent>,
  ) {}

  async get(key: StaticContentKey): Promise<string> {
    const content = await this.repo.findOne({ where: { key } });
    return content?.value || '';
  }

  async getAll(): Promise<Record<string, string>> {
    const contents = await this.repo.find();
    const result: Record<string, string> = {
      service_hours: '',
      intro_text: '',
      footer_text: '',
    };
    for (const c of contents) {
      result[c.key] = c.value;
    }
    return result;
  }

  async set(key: StaticContentKey, value: string): Promise<MenuStaticContent> {
    let content = await this.repo.findOne({ where: { key } });
    if (content) {
      content.value = value;
    } else {
      content = this.repo.create({ key, value });
    }
    return this.repo.save(content);
  }
}

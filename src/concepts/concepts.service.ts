import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';

@Injectable()
export class ConceptsService {
  constructor(
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
  ) {}

  async create(createConceptDto: CreateConceptDto): Promise<Concept> {
    const concept = this.conceptRepository.create(createConceptDto);
    return await this.conceptRepository.save(concept);
  }

  async findAll(): Promise<Concept[]> {
    return await this.conceptRepository.find({
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Concept> {
    const concept = await this.conceptRepository.findOne({ where: { id } });
    if (!concept) {
      throw new NotFoundException(`Concept with ID ${id} not found`);
    }
    return concept;
  }

  async update(id: number, updateConceptDto: UpdateConceptDto): Promise<Concept> {
    const concept = await this.findOne(id);
    const updatedConcept = Object.assign(concept, updateConceptDto);
    return await this.conceptRepository.save(updatedConcept);
  }

  async remove(id: number): Promise<void> {
    const concept = await this.findOne(id);
    await this.conceptRepository.remove(concept);
  }
}

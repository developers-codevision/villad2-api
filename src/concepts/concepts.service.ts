import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';
import { ConceptProduct } from './entities/concept-product.entity';
import { BillingItem } from '../billing/entities/billing-item.entity';
import { Billing } from '../billing/entities/billing.entity';

@Injectable()
export class ConceptsService {
  constructor(
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    @InjectRepository(ConceptProduct)
    private readonly conceptProductRepository: Repository<ConceptProduct>,
    @InjectRepository(BillingItem)
    private readonly billingItemRepository: Repository<BillingItem>,
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
  ) {}

  async create(createConceptDto: CreateConceptDto): Promise<Concept> {
    const concept = this.conceptRepository.create({
      name: createConceptDto.name,
      category: createConceptDto.category,
    });
    const savedConcept = await this.conceptRepository.save(concept);

    if (createConceptDto.products && createConceptDto.products.length > 0) {
      for (const p of createConceptDto.products) {
        const conceptProduct = this.conceptProductRepository.create({
          conceptId: savedConcept.id,
          productId: p.productId,
          quantity: p.quantity,
        });
        await this.conceptProductRepository.save(conceptProduct);
      }
    }

    if (createConceptDto.billingId && createConceptDto.price !== undefined) {
      const billing = await this.billingRepository.findOne({
        where: { id: createConceptDto.billingId },
      });

      if (billing) {
        const billingItem = this.billingItemRepository.create({
          billingId: createConceptDto.billingId,
          conceptId: savedConcept.id,
          quantity: 0,
          priceUsd: createConceptDto.price,
          totalUsd: 0,
          totalCup: 0,
        });
        await this.billingItemRepository.save(billingItem);
      }
    }

    return savedConcept;
  }

  async findAll(): Promise<Concept[]> {
    return await this.conceptRepository.find({
      relations: ['products', 'products.product'],
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Concept> {
    const concept = await this.conceptRepository.findOne({
      where: { id },
      relations: ['products', 'products.product'],
    });
    if (!concept) {
      throw new NotFoundException(`Concept with ID ${id} not found`);
    }
    return concept;
  }

  async update(
    id: number,
    updateConceptDto: UpdateConceptDto,
  ): Promise<Concept> {
    const concept = await this.findOne(id);

    if (updateConceptDto.name !== undefined) {
      concept.name = updateConceptDto.name;
    }
    if (updateConceptDto.category !== undefined) {
      concept.category = updateConceptDto.category;
    }
    await this.conceptRepository.save(concept);

    if (updateConceptDto.products !== undefined) {
      await this.conceptProductRepository.delete({ conceptId: id });
      for (const p of updateConceptDto.products) {
        const conceptProduct = this.conceptProductRepository.create({
          conceptId: id,
          productId: p.productId,
          quantity: p.quantity,
        });
        await this.conceptProductRepository.save(conceptProduct);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const concept = await this.findOne(id);
    await this.conceptRepository.remove(concept);
  }
}

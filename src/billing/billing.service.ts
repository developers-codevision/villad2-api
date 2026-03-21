import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { Billing } from './entities/billing.entity';
import { BillingItem } from './entities/billing-item.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(BillingItem)
    private readonly billingItemRepo: Repository<BillingItem>,
    @InjectRepository(Concept)
    private readonly conceptRepo: Repository<Concept>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Billing> {
    // Check if billing for this date already exists
    const existing = await this.billingRepository.findOne({ where: { date: createBillingDto.date } });
    if (existing) {
      throw new BadRequestException(`A billing sheet for date ${createBillingDto.date} already exists`);
    }

    const billing = new Billing();
    billing.date = createBillingDto.date;
    billing.usdToCupRate = createBillingDto.usdToCupRate;
    billing.eurToCupRate = createBillingDto.eurToCupRate;
    billing.items = [];

    for (const itemDto of createBillingDto.items) {
      if (itemDto.quantity === 0) continue; // Skip items with 0 quantity from the form
      
      const concept = await this.conceptRepo.findOne({ where: { id: itemDto.conceptId } });
      if (!concept) {
        throw new NotFoundException(`Concept ID ${itemDto.conceptId} not found`);
      }

      const item = new BillingItem();
      item.conceptId = concept.id;
      item.quantity = itemDto.quantity;
      item.priceUsd = concept.priceUsd; // Freeze price at the current concept price
      
      // If concept is linked to a product, update daily inventory consumption
      if (concept.productId) {
        await this.productsService.updateDailyConsumption(
          concept.productId,
          createBillingDto.date,
          item.quantity
        );
      }

      billing.items.push(item);
    }

    return await this.billingRepository.save(billing);
  }

  async findAll(): Promise<Billing[]> {
    return await this.billingRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<any> {
    const billing = await this.billingRepository.findOne({ 
      where: { id },
      relations: ['items', 'items.concept'],
    });
    if (!billing) {
      throw new NotFoundException(`Billing sheet with ID ${id} not found`);
    }

    // Enhance response with calculated values as in the excel image
    const items = billing.items.map(item => {
      const totalUsd = Number(item.quantity) * Number(item.priceUsd);
      const cup = totalUsd * Number(billing.usdToCupRate);
      return {
        ...item,
        totalUsd,
        cup
      };
    });

    const subtotalUsd = items.reduce((sum, item) => sum + item.totalUsd, 0);
    const subtotalCup = subtotalUsd * Number(billing.usdToCupRate);
    const tax10Percent = subtotalCup * 0.1;
    const totalCup = subtotalCup + tax10Percent;

    return {
      ...billing,
      items,
      summary: {
        subtotalUsd,
        subtotalCup,
        tax10Percent,
        totalCup
      }
    };
  }

  async getTemplate(date: string): Promise<any> {
    const concepts = await this.conceptRepo.find({ order: { category: 'ASC' } });
    return {
      date,
      usdToCupRate: 1, // default
      eurToCupRate: 1, 
      items: concepts.map(c => ({
        conceptId: c.id,
        concept: c,
        quantity: 0,
        priceUsd: c.priceUsd
      }))
    };
  }

  async update(
    id: number,
    updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    const billing = await this.findOne(id);
    
    // In a full implementation, you'd merge nested items gracefully.
    // For simplicity, we can update simple properties or recreate items.
    if (updateBillingDto.usdToCupRate !== undefined) billing.usdToCupRate = updateBillingDto.usdToCupRate;
    if (updateBillingDto.eurToCupRate !== undefined) billing.eurToCupRate = updateBillingDto.eurToCupRate;
    
    return await this.billingRepository.save(billing);
  }

  async remove(id: number): Promise<void> {
    const billing = await this.findOne(id);
    await this.billingRepository.remove(billing);
  }
}

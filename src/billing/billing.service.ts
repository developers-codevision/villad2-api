import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { CreateBillingRecordDto } from './dto/create-billing-record.dto';
import { Billing } from './entities/billing.entity';
import { BillingItem } from './entities/billing-item.entity';
import { BillingRecord } from './entities/billing-record.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { ProductsService } from '../products/products.service';
import { BillingRecordService } from './services/billing-record.service';

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
    private readonly billingRecordService: BillingRecordService,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Billing> {
    // Determine the target date (today if not provided)
    const targetDate = createBillingDto.date || new Date().toISOString().split('T')[0];

    // Check if billing for this date already exists
    const existing = await this.billingRepository.findOne({ where: { date: targetDate } });
    if (existing) {
      throw new BadRequestException(`A billing sheet for date ${targetDate} already exists`);
    }

    // Find the previous day's billing
    const previousDate = this.getPreviousDate(targetDate);
    const previousBilling = await this.billingRepository.findOne({
      where: { date: previousDate },
      relations: ['items'],
    });

    const billing = new Billing();
    billing.date = targetDate;
    billing.items = [];

    if (previousBilling) {
      // Copy rates from previous day
      billing.usdToCupRate = previousBilling.usdToCupRate;
      billing.eurToCupRate = previousBilling.eurToCupRate;

      // Copy items with quantity = 0
      for (const prevItem of previousBilling.items) {
        const item = new BillingItem();
        item.conceptId = prevItem.conceptId;
        item.quantity = 0; // Reset quantity for the new day
        item.priceUsd = prevItem.priceUsd;
        billing.items.push(item);
      }
    } else {
      // No previous billing found - create first billing with all concepts
      billing.usdToCupRate = 1;
      billing.eurToCupRate = 1;

      // Get all concepts and create billing items
      const concepts = await this.conceptRepo.find();
      for (const concept of concepts) {
        const item = new BillingItem();
        item.conceptId = concept.id;
        item.quantity = 0;
        item.priceUsd = 0; // Price will be set via update
        billing.items.push(item);
      }
    }

    return await this.billingRepository.save(billing);
  }

  private getPreviousDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
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
        priceUsd: 0, // El precio se define al crear el BillingItem, no en el concepto
      }))
    };
  }

  async update(
    id: number,
    updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    const billing = await this.billingRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!billing) {
      throw new NotFoundException(`Billing sheet with ID ${id} not found`);
    }

    // Update exchange rates if provided
    if (updateBillingDto.usdToCupRate !== undefined) {
      billing.usdToCupRate = updateBillingDto.usdToCupRate;
    }
    if (updateBillingDto.eurToCupRate !== undefined) {
      billing.eurToCupRate = updateBillingDto.eurToCupRate;
    }

    // Update items if provided
    if (updateBillingDto.items && updateBillingDto.items.length > 0) {
      for (const itemDto of updateBillingDto.items) {
        // Find the billing item by conceptId
        const billingItem = billing.items.find(
          (item) => item.conceptId === itemDto.conceptId,
        );
        if (!billingItem) {
          throw new NotFoundException(
            `Billing item with conceptId ${itemDto.conceptId} not found in this billing`,
          );
        }

        // Update quantity
        billingItem.quantity = itemDto.quantity;

        // Recalculate totals
        billingItem.totalUsd =
          Number(billingItem.quantity) * Number(billingItem.priceUsd);
        billingItem.totalCup =
          billingItem.totalUsd * Number(billing.usdToCupRate);
      }
    }

    return await this.billingRepository.save(billing);
  }

  async createRecord(
    billingId: number,
    createRecordDto: CreateBillingRecordDto,
  ): Promise<BillingRecord> {
    // Verify billing exists
    const billing = await this.billingRepository.findOne({
      where: { id: billingId },
    });
    if (!billing) {
      throw new NotFoundException(`Billing with ID ${billingId} not found`);
    }

    // Set billingId and date from the billing if not provided
    const recordDto = {
      ...createRecordDto,
      billingId,
      date: createRecordDto.date || billing.date,
    };

    return await this.billingRecordService.create(recordDto);
  }

  async remove(id: number): Promise<void> {
    const billing = await this.findOne(id);
    await this.billingRepository.remove(billing);
  }
}

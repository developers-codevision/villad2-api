import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const targetDate =
      createBillingDto.date || new Date().toISOString().split('T')[0];

    // Check if billing for this date already exists
    const existing = await this.billingRepository.findOne({
      where: { date: targetDate },
    });
    if (existing) {
      throw new BadRequestException(
        `A billing sheet for date ${targetDate} already exists`,
      );
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

    const items = billing.items.map((item) => {
      const totalUsd = Number(item.totalUsd || 0);
      const totalCup = Number(item.totalCup || 0);
      const quantity = Number(item.quantity || 0);
      const priceUsd = Number(item.priceUsd || 0);
      const category = item.concept?.category || '';
      const hasTax10 = category.toLowerCase() === 'bar';
      const tax10Usd = hasTax10 ? totalUsd * 0.1 : 0;
      const tax10Cup = hasTax10 ? totalCup * 0.1 : 0;
      return {
        ...item,
        quantity,
        priceUsd,
        totalUsd,
        totalCup,
        hasTax10,
        tax10Usd,
        tax10Cup,
      };
    });

    const subtotalUsd = items.reduce((sum, item) => sum + item.totalUsd, 0);
    const subtotalCup = items.reduce((sum, item) => sum + item.totalCup, 0);
    const tax10PercentUsd = items.reduce((sum, item) => sum + item.tax10Usd, 0);
    const tax10PercentCup = items.reduce((sum, item) => sum + item.tax10Cup, 0);
    const totalCup = subtotalCup + tax10PercentCup;
    const totalUsd = subtotalUsd + tax10PercentUsd;

    return {
      ...billing,
      items,
      summary: {
        subtotalUsd,
        subtotalCup,
        tax10PercentUsd,
        tax10PercentCup,
        totalCup,
        totalUsd,
      },
    };
  }

  async getTemplate(date: string): Promise<any> {
    const concepts = await this.conceptRepo.find({
      order: { category: 'ASC' },
    });
    return {
      date,
      usdToCupRate: 1, // default
      eurToCupRate: 1,
      items: concepts.map((c) => ({
        conceptId: c.id,
        concept: c,
        quantity: 0,
        priceUsd: 0, // El precio se define al crear el BillingItem, no en el concepto
      })),
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

        // Update quantity if provided
        if (itemDto.quantity !== undefined) {
          billingItem.quantity = itemDto.quantity;
        }

        // Update price if provided
        if (itemDto.priceUsd !== undefined) {
          billingItem.priceUsd = itemDto.priceUsd;
        }

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

    // Set billingId from the billing if not provided
    const recordDto = {
      ...createRecordDto,
      billingId,
    };

    return await this.billingRecordService.create(recordDto);
  }

  async parkRecord(id: number): Promise<BillingRecord> {
    const record = await this.billingRecordService.findOne(id);
    if (!record) {
      throw new NotFoundException(`Billing record with ID ${id} not found`);
    }

    record.isParked = true;
    record.paymentStatus = 'pending';
    return await this.billingRecordService.save(record);
  }

  async findRecord(id: number): Promise<BillingRecord> {
    return await this.billingRecordService.findOne(id);
  }

  async findAllRecords(): Promise<BillingRecord[]> {
    return await this.billingRecordService.findAll();
  }

  async findAllRecordsByBilling(billingId: number): Promise<BillingRecord[]> {
    return await this.billingRecordService.findAllByBilling(billingId);
  }

  async removeRecord(id: number): Promise<void> {
    return await this.billingRecordService.remove(id);
  }

  async remove(id: number): Promise<void> {
    const billing = await this.findOne(id);
    await this.billingRepository.remove(billing);
  }

  async findBillingItem(id: number): Promise<BillingItem> {
    const item = await this.billingItemRepo.findOne({
      where: { id },
      relations: ['concept'],
    });
    if (!item) {
      throw new NotFoundException(`Billing item with ID ${id} not found`);
    }
    return item;
  }
}


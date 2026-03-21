import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { Billing } from './entities/billing.entity';
import { ExtraBilling } from './entities/extra-billing.entity';
import { ExtraBillingItem } from './entities/extra-billing-item.entity';
import { CreateExtraBillingDto } from './dto/create-extra-billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(ExtraBilling)
    private readonly extraBillingRepo: Repository<ExtraBilling>,
    @InjectRepository(ExtraBillingItem)
    private readonly extraBillingItemRepo: Repository<ExtraBillingItem>,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Billing> {
    const billing = this.billingRepository.create(createBillingDto);
    return await this.billingRepository.save(billing);
  }

  async findAll(): Promise<Billing[]> {
    return await this.billingRepository.find();
  }

  async findOne(id: number): Promise<Billing> {
    const billing = await this.billingRepository.findOne({ where: { id } });
    if (!billing) {
      throw new NotFoundException(`Billing with ID ${id} not found`);
    }
    return billing;
  }

  async update(
    id: number,
    updateBillingDto: UpdateBillingDto,
  ): Promise<Billing> {
    const billing = await this.findOne(id);
    const updatedBilling = Object.assign(billing, updateBillingDto);
    return await this.billingRepository.save(updatedBilling);
  }

  async remove(id: number): Promise<void> {
    const billing = await this.findOne(id);
    await this.billingRepository.remove(billing);
  }

  async createExtraBilling(createExtraDto: CreateExtraBillingDto): Promise<ExtraBilling> {
    const extraBilling = new ExtraBilling();
    extraBilling.roomId = createExtraDto.roomId;
    extraBilling.items = [];
    
    let totalAmount = 0;
    for (const itemDto of createExtraDto.items) {
      const item = new ExtraBillingItem();
      item.productId = itemDto.productId;
      item.quantity = itemDto.quantity;
      item.price = itemDto.price;
      item.amount = item.quantity * item.price;
      // Depending on the flow, we should decrease inventory here.
      // But for now we just record it to be fully aligned with 'necesito construir...'
      totalAmount += item.amount;
      extraBilling.items.push(item);
    }
    extraBilling.totalAmount = totalAmount;

    return await this.extraBillingRepo.save(extraBilling);
  }

  async findAllExtraBillings(): Promise<ExtraBilling[]> {
    return await this.extraBillingRepo.find({ relations: ['items', 'items.product', 'room'] });
  }
}

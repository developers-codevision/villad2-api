import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingRecord } from '../entities/billing-record.entity';
import { BillingPayment } from '../entities/billing-payment.entity';
import { CreateBillingRecordDto } from '../dto/create-billing-record.dto';
import { Billing } from '../entities/billing.entity';
import { InventoryConsumptionService } from './inventory-consumption.service';

@Injectable()
export class BillingRecordService {
  constructor(
    @InjectRepository(BillingRecord)
    private readonly billingRecordRepository: Repository<BillingRecord>,
    @InjectRepository(BillingPayment)
    private readonly billingPaymentRepository: Repository<BillingPayment>,
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    private readonly inventoryConsumptionService: InventoryConsumptionService,
  ) {}

  async create(createDto: CreateBillingRecordDto): Promise<BillingRecord> {
    // Verify billing exists
    const billing = await this.billingRepository.findOne({
      where: { id: createDto.billingId },
      relations: ['items', 'items.concept'],
    });
    if (!billing) {
      throw new NotFoundException(
        `Billing with ID ${createDto.billingId} not found`,
      );
    }

    // Calculate tax 10% if not provided
    let tax10Percent = createDto.tax10Percent;
    if (!tax10Percent) {
      tax10Percent = createDto.totalAmount * 0.1;
    }

    const tip = createDto.tip || 0;
    const grandTotal = createDto.totalAmount + tax10Percent + tip;

    // Create the billing record
    const record = this.billingRecordRepository.create({
      billingId: createDto.billingId,
      date: createDto.date || billing.date,
      totalAmount: createDto.totalAmount,
      tip,
      tax10Percent,
      grandTotal,
      conceptConsumptions: createDto.conceptConsumptions,
      paymentStatus: 'pending',
      pendingAmount: grandTotal,
      advanceBalance: 0,
      isParked: false,
    });

    const savedRecord = await this.billingRecordRepository.save(record);

    // Create payments if provided (simplified - full logic in payment service)
    if (createDto.totalPaid > 0) {
      const payment = this.billingPaymentRepository.create({
        billingRecordId: savedRecord.id,
        paymentMethod: 'cash_usd', // Default - will be expanded
        currency: 'USD',
        amount: createDto.totalPaid,
        amountInUsd: createDto.totalPaid,
        exchangeRate: 1,
        billDenominations: createDto.billDenominations || null,
        isAdvance: false,
        advanceConsumed: false,
      });
      await this.billingPaymentRepository.save(payment);

      // Update payment status
      if (createDto.totalPaid >= grandTotal) {
        savedRecord.paymentStatus = 'paid';
        savedRecord.pendingAmount = 0;
        savedRecord.advanceBalance = createDto.totalPaid - grandTotal;
      } else {
        savedRecord.paymentStatus = 'partial';
        savedRecord.pendingAmount = grandTotal - createDto.totalPaid;
      }
      await this.billingRecordRepository.save(savedRecord);
    }

    // Update inventory (IPV) for each concept consumed
    // consumeImmediately es una opcion puntual de la facturacion
    const consumptionItems = createDto.conceptConsumptions.map((c) => ({
      billingItemId: c.billingItemId || 0,
      conceptId: c.conceptId,
      quantity: c.quantityConsumed,
    }));

    await this.inventoryConsumptionService.consumeInventoryForRecord(
      savedRecord.id,
      consumptionItems,
      savedRecord.date,
      createDto.consumeImmediately !== false, // Por defecto consume inmediatamente
    );

    return savedRecord;
  }

  async findAllByBilling(billingId: number): Promise<BillingRecord[]> {
    return await this.billingRecordRepository.find({
      where: { billingId },
      relations: ['payments', 'tipDistributions', 'tax10Distributions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BillingRecord> {
    const record = await this.billingRecordRepository.findOne({
      where: { id },
      relations: ['payments', 'tipDistributions', 'tax10Distributions'],
    });
    if (!record) {
      throw new NotFoundException(`Billing record with ID ${id} not found`);
    }
    return record;
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.billingRecordRepository.remove(record);
  }

  async save(record: BillingRecord): Promise<BillingRecord> {
    return await this.billingRecordRepository.save(record);
  }
}

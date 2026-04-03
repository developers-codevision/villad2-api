import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingRecord } from '../entities/billing-record.entity';
import { BillingPayment } from '../entities/billing-payment.entity';
import { CreateBillingRecordDto } from '../dto/create-billing-record.dto';
import { Billing } from '../entities/billing.entity';
import { InventoryConsumptionService } from './inventory-consumption.service';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Injectable()
export class BillingRecordService {
  constructor(
    @InjectRepository(BillingRecord)
    private readonly billingRecordRepository: Repository<BillingRecord>,
    @InjectRepository(BillingPayment)
    private readonly billingPaymentRepository: Repository<BillingPayment>,
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly inventoryConsumptionService: InventoryConsumptionService,
  ) {}

  async create(createDto: CreateBillingRecordDto): Promise<BillingRecord> {
    const billing = await this.billingRepository.findOne({
      where: { id: createDto.billingId },
      relations: ['items', 'items.concept'],
    });
    if (!billing) {
      throw new NotFoundException(
        `Billing with ID ${createDto.billingId} not found`,
      );
    }

    let tax10Percent = createDto.tax10Percent;
    if (!tax10Percent) {
      tax10Percent = createDto.totalAmount * 0.1;
    }

    const tip = createDto.tip || 0;
    const grandTotal = createDto.totalAmount + tax10Percent + tip;
    const lateBilling = createDto.lateBilling || false;

    if (!lateBilling) {
      if (createDto.totalPaid === undefined || createDto.totalPaid === null) {
        throw new BadRequestException(
          'totalPaid es requerido cuando lateBilling es false',
        );
      }
      if (
        (!createDto.billDenominations ||
          createDto.billDenominations.length === 0) &&
        createDto.totalPaid > 0
      ) {
        throw new BadRequestException(
          'billDenominations es requerido cuando totalPaid > 0 y lateBilling es false',
        );
      }
    }

    if (createDto.reservationId) {
      const reservation = await this.reservationRepository.findOne({
        where: { id: createDto.reservationId },
      });
      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${createDto.reservationId} not found`,
        );
      }
    }

    const record = this.billingRecordRepository.create({
      billingId: createDto.billingId,
      reservationId: createDto.reservationId || null,
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
      lateBilling,
    });

    const savedRecord = await this.billingRecordRepository.save(record);

    if (lateBilling && createDto.reservationId) {
      const reservation = await this.reservationRepository.findOne({
        where: { id: createDto.reservationId },
      });
      if (reservation) {
        reservation.pendingDebt = Number(reservation.pendingDebt) + grandTotal;
        await this.reservationRepository.save(reservation);
      }
    }

    if (!lateBilling && createDto.totalPaid > 0) {
      const payment = this.billingPaymentRepository.create({
        billingRecordId: savedRecord.id,
        paymentMethod: 'cash_usd',
        currency: 'USD',
        amount: createDto.totalPaid,
        amountInUsd: createDto.totalPaid,
        exchangeRate: 1,
        billDenominations: createDto.billDenominations || null,
        isAdvance: false,
        advanceConsumed: false,
      });
      await this.billingPaymentRepository.save(payment);

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

    const consumptionItems = createDto.conceptConsumptions.map((c) => ({
      billingItemId: c.billingItemId || 0,
      conceptId: c.conceptId,
      quantity: c.quantityConsumed,
    }));

    await this.inventoryConsumptionService.consumeInventoryForRecord(
      savedRecord.id,
      consumptionItems,
      savedRecord.date,
      createDto.consumeImmediately !== false,
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

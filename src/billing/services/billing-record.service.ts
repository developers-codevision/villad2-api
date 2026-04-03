import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingRecord } from '../entities/billing-record.entity';
import { BillingPayment } from '../entities/billing-payment.entity';
import {
  CreateBillingRecordDto,
  BillingPaymentDto,
  Currency,
  PaymentMethod,
  BillingItemDto,
} from '../dto/create-billing-record.dto';
import { Billing } from '../entities/billing.entity';
import { InventoryConsumptionService } from './inventory-consumption.service';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Concept } from '../../concepts/entities/concept.entity';

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
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    private readonly inventoryConsumptionService: InventoryConsumptionService,
  ) {}

  private convertToUsd(
    amount: number,
    currency: Currency,
    exchangeRate: number,
    billing: Billing,
  ): number {
    if (currency === Currency.USD) {
      return amount;
    }
    if (currency === Currency.EUR) {
      return amount * exchangeRate;
    }
    if (currency === Currency.CUP) {
      return amount / Number(billing.usdToCupRate);
    }
    return amount;
  }

  async create(createDto: CreateBillingRecordDto): Promise<BillingRecord> {
    const billing = await this.billingRepository.findOne({
      where: { id: createDto.billingId },
      relations: ['items', 'items.concept', 'items.concept.products'],
    });
    if (!billing) {
      throw new NotFoundException(
        `Billing with ID ${createDto.billingId} not found`,
      );
    }

    const items = createDto.items || [];
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.priceUsd,
      0,
    );
    const tax10Percent = totalAmount * 0.1;
    const tip = createDto.tip || 0;
    const grandTotal = totalAmount + tax10Percent + tip;
    const lateBilling = createDto.lateBilling || false;
    const payments = createDto.payments || [];

    if (!lateBilling && payments.length === 0) {
      throw new BadRequestException(
        'payments es requerido cuando lateBilling es false',
      );
    }

    const hasCashPayment = payments.some(
      (p) =>
        p.paymentMethod === PaymentMethod.CASH_USD ||
        p.paymentMethod === PaymentMethod.CASH_EUR ||
        p.paymentMethod === PaymentMethod.CASH_CUP,
    );

    if (!lateBilling && hasCashPayment) {
      const hasDenominations = payments.some(
        (p) => p.billDenominations && p.billDenominations.length > 0,
      );
      if (!hasDenominations) {
        throw new BadRequestException(
          'billDenominations es requerido para pagos en efectivo',
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
      totalAmount,
      tip,
      tax10Percent,
      grandTotal,
      productConsumptions: [],
      paymentStatus: 'pending',
      pendingAmount: grandTotal,
      advanceBalance: 0,
      isParked: false,
      lateBilling,
      pendingConsumption: false,
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

    for (const paymentDto of payments) {
      const exchangeRate = paymentDto.exchangeRate ?? 1;
      const amountInUsd =
        paymentDto.amountInUsd ??
        this.convertToUsd(
          paymentDto.amount,
          paymentDto.currency,
          exchangeRate,
          billing,
        );

      const payment = this.billingPaymentRepository.create({
        billingRecordId: savedRecord.id,
        paymentMethod: paymentDto.paymentMethod,
        currency: paymentDto.currency,
        amount: paymentDto.amount,
        amountInUsd,
        exchangeRate,
        billDenominations: paymentDto.billDenominations || null,
      });
      await this.billingPaymentRepository.save(payment);
    }

    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.amountInUsd || p.amount),
      0,
    );
    if (!lateBilling && totalPaid > 0) {
      if (totalPaid >= Number(grandTotal)) {
        savedRecord.paymentStatus = 'paid';
        savedRecord.pendingAmount = 0;
        savedRecord.advanceBalance = totalPaid - Number(grandTotal);
      } else {
        savedRecord.paymentStatus = 'partial';
        savedRecord.pendingAmount = Number(grandTotal) - totalPaid;
      }
      await this.billingRecordRepository.save(savedRecord);
    }

    if (createDto.consumeImmediately !== false) {
      const consumptionItems = [];

      for (const item of items) {
        if (item.productId && item.productQuantity) {
          consumptionItems.push({
            billingItemId: 0,
            productId: item.productId,
            quantity: item.productQuantity,
          });
        } else {
          const concept = await this.conceptRepository.findOne({
            where: { id: item.conceptId },
            relations: ['products', 'products.product'],
          });

          if (concept?.products) {
            for (const cp of concept.products) {
              consumptionItems.push({
                billingItemId: 0,
                productId: cp.productId,
                quantity: Number(cp.quantity) * item.quantity,
              });
            }
          }
        }
      }

      await this.inventoryConsumptionService.consumeInventoryForRecord(
        savedRecord.id,
        consumptionItems,
        savedRecord.date,
        true,
      );
    }

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

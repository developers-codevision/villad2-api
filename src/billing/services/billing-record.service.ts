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
} from '../dto/create-billing-record.dto';
import { Billing } from '../entities/billing.entity';
import { InventoryConsumptionService } from './inventory-consumption.service';
import { Reservation } from '../../reservations/entities/reservation.entity';

const convertToUsd = (
  amount: number,
  currency: Currency,
  exchangeRate: number,
  billing: Billing,
): number => {
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
};

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
      relations: ['items', 'items.concept', 'items.concept.products'],
    });
    if (!billing) {
      throw new NotFoundException(
        `Billing with ID ${createDto.billingId} not found`,
      );
    }

    const items = createDto.items || [];
    const productConsumptions = items.map((item) => ({
      productId: item.productId,
      quantityConsumed: item.productQuantity,
    }));

    const totalAmount = billing.items
      .filter((item) => item.id === createDto.billingItemId)
      .reduce((sum, item) => sum + Number(item.totalUsd), 0);

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

    for (const paymentDto of payments) {
      const hasDenominations =
        paymentDto.billDenominations && paymentDto.billDenominations.length > 0;
      const hasAmount = paymentDto.amount !== undefined;

      if (paymentDto.paymentMethod.startsWith('cash_') && !hasDenominations) {
        throw new BadRequestException(
          'billDenominations es requerido para pagos en efectivo',
        );
      }

      if (!paymentDto.paymentMethod.startsWith('cash_') && !hasAmount) {
        throw new BadRequestException(
          'amount es requerido para pagos que no son en efectivo',
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
      date: billing.date,
      totalAmount,
      tip,
      tax10Percent,
      grandTotal,
      productConsumptions,
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
      let amountInUsd: number;

      if (
        paymentDto.billDenominations &&
        paymentDto.billDenominations.length > 0
      ) {
        const calculatedAmount = paymentDto.billDenominations.reduce(
          (sum, d) => {
            const rate =
              d.currency === Currency.USD
                ? 1
                : d.currency === Currency.EUR
                  ? Number(billing.eurToCupRate) / Number(billing.usdToCupRate)
                  : 1 / Number(billing.usdToCupRate);
            return sum + d.value * d.quantity * rate;
          },
          0,
        );

        if (
          paymentDto.amount !== undefined &&
          Math.abs(paymentDto.amount - calculatedAmount) > 0.01
        ) {
          throw new BadRequestException(
            `El amount (${paymentDto.amount}) no coincide con la suma de las denominaciones (${calculatedAmount})`,
          );
        }

        amountInUsd = calculatedAmount;
      } else if (paymentDto.amount !== undefined) {
        amountInUsd = paymentDto.amount;
      } else {
        throw new BadRequestException(
          'Se requiere amount o billDenominations para el pago',
        );
      }

      const payment = this.billingPaymentRepository.create({
        billingRecordId: savedRecord.id,
        paymentMethod: paymentDto.paymentMethod,
        amount: amountInUsd,
        amountInUsd,
        exchangeRate: 1,
        billDenominations: paymentDto.billDenominations || null,
      });
      await this.billingPaymentRepository.save(payment);
    }

    const totalPaid = payments.reduce((sum, p) => {
      if (p.billDenominations && p.billDenominations.length > 0) {
        return (
          sum +
          p.billDenominations.reduce((s, d) => {
            const rate =
              d.currency === Currency.USD
                ? 1
                : d.currency === Currency.EUR
                  ? Number(billing.eurToCupRate) / Number(billing.usdToCupRate)
                  : 1 / Number(billing.usdToCupRate);
            return s + d.value * d.quantity * rate;
          }, 0)
        );
      }
      return sum + (p.amount || 0);
    }, 0);

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
      await this.inventoryConsumptionService.consumeInventoryForRecord(
        savedRecord.id,
        productConsumptions.map((p) => ({
          billingItemId: createDto.billingItemId,
          productId: p.productId,
          quantity: p.quantityConsumed,
        })),
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

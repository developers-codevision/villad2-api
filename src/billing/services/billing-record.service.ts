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
import { BillingItem } from '../entities/billing-item.entity';
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
    @InjectRepository(BillingItem)
    private readonly billingItemRepository: Repository<BillingItem>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly inventoryConsumptionService: InventoryConsumptionService,
  ) {}

  async create(createDto: CreateBillingRecordDto): Promise<BillingRecord> {
    const billing = await this.getBilling(createDto.billingId);
    this.validatePayments(createDto);
    await this.validateReservation(createDto.reservationId);

    const totals = this.calculateTotals(createDto);
    const record = this.createRecordEntity(createDto, billing, totals);
    const savedRecord = await this.billingRecordRepository.save(record);

    await this.handleLateBilling(createDto, totals.grandTotal);
    await this.processPayments(createDto.payments, savedRecord, billing);
    await this.updatePaymentStatus(savedRecord, createDto, totals.grandTotal);
    await this.consumeInventoryIfNeeded(createDto, savedRecord, totals.productConsumptions);
    await this.updateBillingItem(createDto, billing, totals.totalAmount);

    return savedRecord;
  }

  private async getBilling(billingId: number): Promise<Billing> {
    const billing = await this.billingRepository.findOne({
      where: { id: billingId },
      relations: ['items', 'items.concept', 'items.concept.products'],
    });
    if (!billing) {
      throw new NotFoundException(`Billing with ID ${billingId} not found`);
    }
    return billing;
  }

  private validatePayments(createDto: CreateBillingRecordDto): void {
    const { payments, lateBilling } = createDto;
    const paymentList = payments || [];

    if (!lateBilling && paymentList.length === 0) {
      throw new BadRequestException('payments es requerido cuando lateBilling es false');
    }

    for (const paymentDto of paymentList) {
      const hasDenominations = paymentDto.billDenominations?.length > 0;
      const hasAmount = paymentDto.amount !== undefined;

      if (paymentDto.paymentMethod.startsWith('cash_') && !hasDenominations) {
        throw new BadRequestException('billDenominations es requerido para pagos en efectivo');
      }

      if (!paymentDto.paymentMethod.startsWith('cash_') && !hasAmount) {
        throw new BadRequestException('amount es requerido para pagos que no son en efectivo');
      }
    }
  }

  private async validateReservation(reservationId?: number): Promise<void> {
    if (reservationId) {
      const reservation = await this.reservationRepository.findOne({
        where: { id: reservationId },
      });
      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
      }
    }
  }

  private calculateTotals(createDto: CreateBillingRecordDto) {
    const productConsumptions = (createDto.items || []).map((item) => ({
      productId: item.productId,
      quantityConsumed: item.productQuantity,
    }));

    const totalAmount = createDto.quantity * createDto.unitPrice;
    const tax10Percent = totalAmount * 0.1;
    const tip = createDto.tip || 0;
    const grandTotal = totalAmount + tax10Percent + tip;

    return { productConsumptions, totalAmount, tax10Percent, tip, grandTotal };
  }

  private createRecordEntity(
    createDto: CreateBillingRecordDto,
    billing: Billing,
    totals: { productConsumptions: any[]; totalAmount: number; tax10Percent: number; tip: number; grandTotal: number },
  ): BillingRecord {
    const record = this.billingRecordRepository.create({
      billingId: createDto.billingId,
      reservationId: createDto.reservationId || null,
      date: billing.date,
      totalAmount: totals.totalAmount,
      tip: totals.tip,
      tax10Percent: totals.tax10Percent,
      grandTotal: totals.grandTotal,
      productConsumptions: totals.productConsumptions,
      paymentStatus: 'pending',
      pendingAmount: totals.grandTotal,
      advanceBalance: createDto.advanceBalance || 0,
      change: createDto.change || 0,
      isParked: false,
      lateBilling: createDto.lateBilling || false,
      pendingConsumption: false,
    });
    return record;
  }

  private async handleLateBilling(createDto: CreateBillingRecordDto, grandTotal: number): Promise<void> {
    if (createDto.lateBilling && createDto.reservationId) {
      const reservation = await this.reservationRepository.findOne({
        where: { id: createDto.reservationId },
      });
      if (reservation) {
        reservation.pendingDebt = Number(reservation.pendingDebt) + grandTotal;
        await this.reservationRepository.save(reservation);
      }
    }
  }

  private async processPayments(
    payments: BillingPaymentDto[] | undefined,
    savedRecord: BillingRecord,
    billing: Billing,
  ): Promise<void> {
    const paymentList = payments || [];

    for (const paymentDto of paymentList) {
      const amountInUsd = this.calculatePaymentAmount(paymentDto, billing);
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
  }

  private calculatePaymentAmount(paymentDto: BillingPaymentDto, billing: Billing): number {
    if (paymentDto.billDenominations && paymentDto.billDenominations.length > 0) {
      const calculatedAmount = paymentDto.billDenominations.reduce((sum, d) => {
        const rate = this.getExchangeRate(d.currency, billing);
        return sum + d.value * d.quantity * rate;
      }, 0);

      if (paymentDto.amount !== undefined && Math.abs(paymentDto.amount - calculatedAmount) > 0.01) {
        throw new BadRequestException(
          `El amount (${paymentDto.amount}) no coincide con la suma de las denominaciones (${calculatedAmount})`,
        );
      }
      return calculatedAmount;
    }
    return paymentDto.amount || 0;
  }

  private getExchangeRate(currency: Currency, billing: Billing): number {
    if (currency === Currency.USD) return 1;
    if (currency === Currency.EUR) return Number(billing.eurToCupRate) / Number(billing.usdToCupRate);
    return 1 / Number(billing.usdToCupRate);
  }

  private async updatePaymentStatus(
    savedRecord: BillingRecord,
    createDto: CreateBillingRecordDto,
    grandTotal: number,
  ): Promise<void> {
    const payments = createDto.payments || [];
    if (createDto.lateBilling || payments.length === 0) return;

    const totalPaid = this.calculateTotalPaid(payments, savedRecord.billingId);
    const change = createDto.change || 0;

    if (totalPaid >= Number(grandTotal) + change) {
      savedRecord.paymentStatus = 'paid';
      savedRecord.pendingAmount = 0;
      savedRecord.advanceBalance = (createDto.advanceBalance || 0) + (totalPaid - Number(grandTotal) - change);
      savedRecord.change = change;
    } else if (totalPaid >= Number(grandTotal)) {
      savedRecord.paymentStatus = 'paid';
      savedRecord.pendingAmount = 0;
      savedRecord.advanceBalance = createDto.advanceBalance || 0;
    } else {
      savedRecord.paymentStatus = 'partial';
      savedRecord.pendingAmount = Number(grandTotal) - totalPaid;
    }
    await this.billingRecordRepository.save(savedRecord);
  }

  private calculateTotalPaid(payments: BillingPaymentDto[], billingId: number): number {
    return payments.reduce((sum, p) => {
      if (p.billDenominations && p.billDenominations.length > 0) {
        return sum + p.billDenominations.reduce((s, d) => s + d.value * d.quantity, 0);
      }
      return sum + (p.amount || 0);
    }, 0);
  }

  private async consumeInventoryIfNeeded(
    createDto: CreateBillingRecordDto,
    savedRecord: BillingRecord,
    productConsumptions: { productId: number; quantityConsumed: number }[],
  ): Promise<void> {
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
  }

  private async updateBillingItem(
    createDto: CreateBillingRecordDto,
    billing: Billing,
    totalAmount: number,
  ): Promise<void> {
    if (!createDto.billingItemId) return;

    const billingItem = await this.billingItemRepository.findOne({
      where: { id: createDto.billingItemId },
    });
    if (!billingItem) return;

    billingItem.quantity = Number(billingItem.quantity || 0) + createDto.quantity;
    billingItem.totalUsd = Number(billingItem.totalUsd || 0) + totalAmount;
    billingItem.totalCup = Number(billingItem.totalCup || 0) + totalAmount * Number(billing.usdToCupRate);

    await this.billingItemRepository.save(billingItem);
  }

  async findAll(): Promise<BillingRecord[]> {
    return await this.billingRecordRepository.find({
      relations: ['payments', 'tipDistributions', 'tax10Distributions'],
      order: { createdAt: 'DESC' },
    });
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

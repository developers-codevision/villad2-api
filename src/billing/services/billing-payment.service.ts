import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BillingPayment,
  PaymentMethod,
  Currency,
} from '../entities/billing-payment.entity';
import { BillingRecord } from '../entities/billing-record.entity';

export interface PaymentInput {
  paymentMethod: PaymentMethod;
  currency: Currency;
  amount: number;
  exchangeRate?: number;
  billDenominations?: { value: number; quantity: number }[];
}

export interface PaymentResult {
  totalPaid: number;
  grandTotal: number;
  pendingAmount: number;
  advanceBalance: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overpaid';
  payments: BillingPayment[];
  change: number;
}

@Injectable()
export class BillingPaymentService {
  constructor(
    @InjectRepository(BillingPayment)
    private readonly paymentRepository: Repository<BillingPayment>,
    @InjectRepository(BillingRecord)
    private readonly recordRepository: Repository<BillingRecord>,
  ) {}

  /**
   * Procesa múltiples pagos en diferentes monedas
   * Regla: 1 EUR = 1 USD para el hostal
   */
  async processPayments(
    billingRecordId: number,
    payments: PaymentInput[],
    useAdvanceBalance: boolean = false,
  ): Promise<PaymentResult> {
    const record = await this.recordRepository.findOne({
      where: { id: billingRecordId },
      relations: ['payments'],
    });

    if (!record) {
      throw new NotFoundException(
        `Billing record with ID ${billingRecordId} not found`,
      );
    }

    const grandTotal = Number(record.grandTotal);
    let totalPaid = 0;
    const savedPayments: BillingPayment[] = [];

    // Procesar cada pago
    for (const paymentInput of payments) {
      const amountInUsd = this.convertToUsd(
        paymentInput.amount,
        paymentInput.currency,
        paymentInput.exchangeRate,
      );

      const payment = this.paymentRepository.create({
        billingRecordId,
        paymentMethod: paymentInput.paymentMethod,
        currency: paymentInput.currency,
        amount: paymentInput.amount,
        amountInUsd,
        exchangeRate:
          paymentInput.exchangeRate ||
          this.getDefaultExchangeRate(paymentInput.currency),
        billDenominations: paymentInput.billDenominations || null,
      });

      const saved = await this.paymentRepository.save(payment);
      savedPayments.push(saved);
      totalPaid += amountInUsd;
    }

    // Usar anticipos si está habilitado
    if (useAdvanceBalance && record.advanceBalance > 0) {
      const advanceToUse = Math.min(
        record.advanceBalance,
        grandTotal - totalPaid,
      );
      if (advanceToUse > 0) {
        totalPaid += advanceToUse;
        record.advanceBalance -= advanceToUse;
      }
    }

    // Calcular estado de pago
    let paymentStatus: 'pending' | 'partial' | 'paid' | 'overpaid';
    let pendingAmount = 0;
    let advanceBalance = Number(record.advanceBalance);
    let change = 0;

    if (totalPaid >= grandTotal) {
      paymentStatus = 'paid';
      pendingAmount = 0;
      change = totalPaid - grandTotal;
      // Si hay excedente, va a anticipos
      if (totalPaid > grandTotal) {
        advanceBalance += totalPaid - grandTotal;
      }
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
      pendingAmount = grandTotal - totalPaid;
    } else {
      paymentStatus = 'pending';
      pendingAmount = grandTotal;
    }

    // Actualizar registro
    record.paymentStatus = paymentStatus;
    record.pendingAmount = pendingAmount;
    record.advanceBalance = advanceBalance;
    await this.recordRepository.save(record);

    return {
      totalPaid,
      grandTotal,
      pendingAmount,
      advanceBalance,
      paymentStatus,
      payments: savedPayments,
      change,
    };
  }

  /**
   * Calcula el vuelto considerando las monedas usadas
   */
  calculateChange(
    totalPaid: number,
    grandTotal: number,
    preferredCurrency: Currency = 'USD',
    exchangeRate: number = 1,
  ): { amount: number; currency: Currency } {
    if (totalPaid <= grandTotal) {
      return { amount: 0, currency: preferredCurrency };
    }

    const changeInUsd = totalPaid - grandTotal;

    if (preferredCurrency === 'USD') {
      return { amount: changeInUsd, currency: 'USD' };
    } else if (preferredCurrency === 'EUR') {
      // 1 EUR = 1 USD para el hostal
      return { amount: changeInUsd, currency: 'EUR' };
    } else {
      // CUP
      return { amount: changeInUsd * exchangeRate, currency: 'CUP' };
    }
  }

  /**
   * Convierte cualquier moneda a USD
   * Regla especial: 1 EUR = 1 USD para el hostal
   */
  private convertToUsd(
    amount: number,
    currency: Currency,
    exchangeRate?: number,
  ): number {
    switch (currency) {
      case 'USD':
        return amount;
      case 'EUR':
        // 1 EUR = 1 USD para el hostal (aunque internamente se registra la diferencia)
        return amount;
      case 'CUP':
        return amount / (exchangeRate || 240);
      default:
        return amount;
    }
  }

  private getDefaultExchangeRate(currency: Currency): number {
    switch (currency) {
      case 'USD':
        return 1;
      case 'EUR':
        return 1; // 1 EUR = 1 USD para el hostal
      case 'CUP':
        return 240; // Tasa por defecto
      default:
        return 1;
    }
  }

  /**
   * Obtiene el balance de anticipos disponible
   */
  async getAdvanceBalance(billingRecordId: number): Promise<number> {
    const record = await this.recordRepository.findOne({
      where: { id: billingRecordId },
    });
    return record?.advanceBalance || 0;
  }

  /**
   * Usa anticipos para pagar una factura
   */
  async consumeAdvance(
    fromBillingRecordId: number,
    toBillingRecordId: number,
    amount: number,
  ): Promise<void> {
    const fromRecord = await this.recordRepository.findOne({
      where: { id: fromBillingRecordId },
    });

    if (!fromRecord || fromRecord.advanceBalance < amount) {
      throw new NotFoundException('Insufficient advance balance');
    }

    // Crear un pago de tipo anticipo
    const payment = this.paymentRepository.create({
      billingRecordId: toBillingRecordId,
      paymentMethod: 'cash_usd',
      currency: 'USD',
      amount,
      amountInUsd: amount,
      exchangeRate: 1,
    });

    await this.paymentRepository.save(payment);

    // Actualizar balance del registro origen
    fromRecord.advanceBalance -= amount;
    await this.recordRepository.save(fromRecord);
  }

  /**
   * Obtiene todos los pagos de un registro
   */
  async getPaymentsByRecord(
    billingRecordId: number,
  ): Promise<BillingPayment[]> {
    return await this.paymentRepository.find({
      where: { billingRecordId },
      order: { createdAt: 'DESC' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Billing } from '../entities/billing.entity';
import { BillingItem } from '../entities/billing-item.entity';
import { BillingRecord } from '../entities/billing-record.entity';
import { BillingPayment } from '../entities/billing-payment.entity';
import { TipDistribution } from '../entities/tip-distribution.entity';
import { Tax10Distribution } from '../entities/tax10-distribution.entity';

export interface DailyBillingReport {
  date: string;
  usdToCupRate: number;
  eurToCupRate: number;
  itemsSummary: {
    totalUsd: number;
    totalCup: number;
    tax10Percent: number;
    totalCupWithTax: number;
  };
  recordsSummary: {
    totalRecords: number;
    pendingCount: number;
    partialCount: number;
    paidCount: number;
    totalAmount: number;
    totalTips: number;
    totalTax10: number;
  };
  paymentsSummary: {
    totalPaid: number;
    byMethod: Record<string, number>;
    byCurrency: Record<string, number>;
  };
  tipsDistribution: {
    totalDistributed: number;
    workers: { workerId: number; workerName: string; amount: number }[];
  };
  tax10Distribution: {
    totalDistributed: number;
    workers: { workerId: number; workerName: string; amount: number }[];
  };
}

export interface InventoryConsumptionReport {
  period: { from: string; to: string };
  consumptions: {
    productId: number;
    productName: string;
    totalConsumed: number;
    byDate: { date: string; quantity: number }[];
  }[];
  totals: {
    uniqueProducts: number;
    totalItemsConsumed: number;
  };
}

@Injectable()
export class BillingReportService {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(BillingItem)
    private readonly billingItemRepository: Repository<BillingItem>,
    @InjectRepository(BillingRecord)
    private readonly recordRepository: Repository<BillingRecord>,
    @InjectRepository(BillingPayment)
    private readonly paymentRepository: Repository<BillingPayment>,
    @InjectRepository(TipDistribution)
    private readonly tipRepository: Repository<TipDistribution>,
    @InjectRepository(Tax10Distribution)
    private readonly tax10Repository: Repository<Tax10Distribution>,
  ) {}

  async getDailyReport(date: string): Promise<DailyBillingReport> {
    const billing = await this.billingRepository.findOne({
      where: { date },
      relations: ['items', 'items.concept'],
    });

    if (!billing) {
      return null;
    }

    const itemsSummary = this.calculateItemsSummary(billing);

    const records = await this.recordRepository.find({
      where: { billingId: billing.id },
      relations: ['payments', 'tipDistributions', 'tax10Distributions'],
    });

    const recordsSummary = this.calculateRecordsSummary(records);

    const payments = records.flatMap((r) => r.payments || []);
    const paymentsSummary = this.calculatePaymentsSummary(payments);

    const tipsDistribution = this.calculateTipsDistribution(records);
    const tax10Distribution = this.calculateTax10Distribution(records);

    return {
      date: billing.date,
      usdToCupRate: Number(billing.usdToCupRate),
      eurToCupRate: Number(billing.eurToCupRate),
      itemsSummary,
      recordsSummary,
      paymentsSummary,
      tipsDistribution,
      tax10Distribution,
    };
  }

  async getInventoryConsumptionReport(
    from: string,
    to: string,
  ): Promise<InventoryConsumptionReport> {
    const records = await this.recordRepository.find({
      where: {
        date: Between(from, to),
      },
      relations: ['payments'],
    });

    const billingIds = records.map((r) => r.billingId);
    const uniqueBillingIds = [...new Set(billingIds)];

    const billingItems = await this.billingItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.concept', 'concept')
      .leftJoinAndSelect('item.billing', 'billing')
      .where('item.billingId IN (:...billingIds)', {
        billingIds: uniqueBillingIds,
      })
      .andWhere('item.quantity > 0')
      .getMany();

    const consumptionMap = new Map<
      number,
      {
        productId: number;
        productName: string;
        totalConsumed: number;
        byDate: { date: string; quantity: number }[];
      }
    >();

    for (const item of billingItems) {
      if (!item.concept?.productId) continue;

      const existing = consumptionMap.get(item.concept.productId);
      const quantity = Number(item.quantity);

      if (existing) {
        existing.totalConsumed += quantity;
        const dateEntry = existing.byDate.find(
          (d) => d.date === item.billing.date,
        );
        if (dateEntry) {
          dateEntry.quantity += quantity;
        } else {
          existing.byDate.push({ date: item.billing.date, quantity });
        }
      } else {
        consumptionMap.set(item.concept.productId, {
          productId: item.concept.productId,
          productName: item.concept.name,
          totalConsumed: quantity,
          byDate: [{ date: item.billing.date, quantity }],
        });
      }
    }

    const consumptions = Array.from(consumptionMap.values());
    const totalItemsConsumed = consumptions.reduce(
      (sum, c) => sum + c.totalConsumed,
      0,
    );

    return {
      period: { from, to },
      consumptions,
      totals: {
        uniqueProducts: consumptions.length,
        totalItemsConsumed,
      },
    };
  }

  private calculateItemsSummary(
    billing: Billing,
  ): DailyBillingReport['itemsSummary'] {
    let totalUsd = 0;
    let totalCup = 0;

    for (const item of billing.items || []) {
      const itemTotalUsd = Number(item.quantity) * Number(item.priceUsd);
      totalUsd += itemTotalUsd;
      totalCup += itemTotalUsd * Number(billing.usdToCupRate);
    }

    const tax10Percent = totalCup * 0.1;
    const totalCupWithTax = totalCup + tax10Percent;

    return { totalUsd, totalCup, tax10Percent, totalCupWithTax };
  }

  private calculateRecordsSummary(
    records: BillingRecord[],
  ): DailyBillingReport['recordsSummary'] {
    let pendingCount = 0;
    let partialCount = 0;
    let paidCount = 0;
    let totalAmount = 0;
    let totalTips = 0;
    let totalTax10 = 0;

    for (const record of records) {
      if (record.paymentStatus === 'pending') pendingCount++;
      else if (record.paymentStatus === 'partial') partialCount++;
      else if (
        record.paymentStatus === 'paid' ||
        record.paymentStatus === 'overpaid'
      )
        paidCount++;

      totalAmount += Number(record.grandTotal);
      totalTips += Number(record.tip);
      totalTax10 += Number(record.tax10Percent);
    }

    return {
      totalRecords: records.length,
      pendingCount,
      partialCount,
      paidCount,
      totalAmount,
      totalTips,
      totalTax10,
    };
  }

  private calculatePaymentsSummary(
    payments: BillingPayment[],
  ): DailyBillingReport['paymentsSummary'] {
    let totalPaid = 0;
    const byMethod: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};

    for (const payment of payments) {
      const amountInUsd = Number(payment.amountInUsd);
      totalPaid += amountInUsd;

      byMethod[payment.paymentMethod] =
        (byMethod[payment.paymentMethod] || 0) + amountInUsd;
      byCurrency[payment.currency] =
        (byCurrency[payment.currency] || 0) + amountInUsd;
    }

    return { totalPaid, byMethod, byCurrency };
  }

  private calculateTipsDistribution(
    records: BillingRecord[],
  ): DailyBillingReport['tipsDistribution'] {
    let totalDistributed = 0;
    const workerMap = new Map<
      number,
      { workerId: number; workerName: string; amount: number }
    >();

    for (const record of records) {
      for (const dist of record.tipDistributions || []) {
        totalDistributed += Number(dist.totalTip);
        for (const worker of dist.distributions) {
          const existing = workerMap.get(worker.workerId);
          if (existing) {
            existing.amount += Number(worker.amount);
          } else {
            workerMap.set(worker.workerId, {
              workerId: worker.workerId,
              workerName: worker.workerName,
              amount: Number(worker.amount),
            });
          }
        }
      }
    }

    return {
      totalDistributed,
      workers: Array.from(workerMap.values()),
    };
  }

  private calculateTax10Distribution(
    records: BillingRecord[],
  ): DailyBillingReport['tax10Distribution'] {
    let totalDistributed = 0;
    const workerMap = new Map<
      number,
      { workerId: number; workerName: string; amount: number }
    >();

    for (const record of records) {
      for (const dist of record.tax10Distributions || []) {
        totalDistributed += Number(dist.totalTax10);
        for (const worker of dist.distributions) {
          const existing = workerMap.get(worker.workerId);
          if (existing) {
            existing.amount += Number(worker.amount);
          } else {
            workerMap.set(worker.workerId, {
              workerId: worker.workerId,
              workerName: worker.workerName,
              amount: Number(worker.amount),
            });
          }
        }
      }
    }

    return {
      totalDistributed,
      workers: Array.from(workerMap.values()),
    };
  }
}

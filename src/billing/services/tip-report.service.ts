import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TipDistribution,
  WorkerDistribution,
} from '../entities/tip-distribution.entity';
import { Tax10Distribution } from '../entities/tax10-distribution.entity';
import { BillingRecord } from '../entities/billing-record.entity';

export interface WorkerInput {
  workerId: number;
  workerName: string;
  percentage: number;
}

@Injectable()
export class TipReportService {
  constructor(
    @InjectRepository(TipDistribution)
    private readonly tipRepository: Repository<TipDistribution>,
    @InjectRepository(Tax10Distribution)
    private readonly tax10Repository: Repository<Tax10Distribution>,
    @InjectRepository(BillingRecord)
    private readonly recordRepository: Repository<BillingRecord>,
  ) {}

  /**
   * Distribuye propinas entre trabajadores
   */
  async distributeTips(
    billingRecordId: number,
    workers: WorkerInput[],
  ): Promise<TipDistribution> {
    const record = await this.recordRepository.findOne({
      where: { id: billingRecordId },
    });

    if (!record) {
      throw new NotFoundException(
        `Billing record with ID ${billingRecordId} not found`,
      );
    }

    const totalTip = Number(record.tip);
    if (totalTip <= 0) {
      throw new NotFoundException('No tip to distribute');
    }

    // Validar porcentajes
    const totalPercentage = workers.reduce((sum, w) => sum + w.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new NotFoundException(
        `Percentages must sum to 100, got ${totalPercentage}`,
      );
    }

    // Calcular distribución
    const distributions: WorkerDistribution[] = workers.map((w) => ({
      workerId: w.workerId,
      workerName: w.workerName,
      percentage: w.percentage,
      amount: (totalTip * w.percentage) / 100,
    }));

    const distribution = this.tipRepository.create({
      billingRecordId,
      totalTip,
      distributions,
    });

    return await this.tipRepository.save(distribution);
  }

  /**
   * Distribuye el 10% entre trabajadores
   * La diferencia EUR/USD va al 10%
   */
  async distributeTax10(
    billingRecordId: number,
    workers: WorkerInput[],
  ): Promise<Tax10Distribution> {
    const record = await this.recordRepository.findOne({
      where: { id: billingRecordId },
    });

    if (!record) {
      throw new NotFoundException(
        `Billing record with ID ${billingRecordId} not found`,
      );
    }

    const totalTax10 = Number(record.tax10Percent);
    if (totalTax10 <= 0) {
      throw new NotFoundException('No tax 10% to distribute');
    }

    // Validar porcentajes
    const totalPercentage = workers.reduce((sum, w) => sum + w.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new NotFoundException(
        `Percentages must sum to 100, got ${totalPercentage}`,
      );
    }

    // Calcular distribución
    const distributions: WorkerDistribution[] = workers.map((w) => ({
      workerId: w.workerId,
      workerName: w.workerName,
      percentage: w.percentage,
      amount: (totalTax10 * w.percentage) / 100,
    }));

    const distribution = this.tax10Repository.create({
      billingRecordId,
      totalTax10,
      distributions,
    });

    return await this.tax10Repository.save(distribution);
  }

  /**
   * Reporte de propinas por período
   */
  async getTipReport(
    from: Date,
    to: Date,
  ): Promise<{
    totalTips: number;
    byWorker: { workerId: number; workerName: string; amount: number }[];
    distributions: TipDistribution[];
  }> {
    const distributions = await this.tipRepository
      .createQueryBuilder('dist')
      .leftJoinAndSelect('dist.billingRecord', 'record')
      .where('dist.distributedAt BETWEEN :from AND :to', { from, to })
      .getMany();

    let totalTips = 0;
    const byWorkerMap = new Map<
      number,
      { workerId: number; workerName: string; amount: number }
    >();

    for (const dist of distributions) {
      totalTips += Number(dist.totalTip);
      for (const worker of dist.distributions) {
        const existing = byWorkerMap.get(worker.workerId);
        if (existing) {
          existing.amount += Number(worker.amount);
        } else {
          byWorkerMap.set(worker.workerId, {
            workerId: worker.workerId,
            workerName: worker.workerName,
            amount: Number(worker.amount),
          });
        }
      }
    }

    return {
      totalTips,
      byWorker: Array.from(byWorkerMap.values()),
      distributions,
    };
  }

  /**
   * Reporte del 10% por período
   */
  async getTax10Report(
    from: Date,
    to: Date,
  ): Promise<{
    totalTax10: number;
    byWorker: { workerId: number; workerName: string; amount: number }[];
    distributions: Tax10Distribution[];
  }> {
    const distributions = await this.tax10Repository
      .createQueryBuilder('dist')
      .leftJoinAndSelect('dist.billingRecord', 'record')
      .where('dist.distributedAt BETWEEN :from AND :to', { from, to })
      .getMany();

    let totalTax10 = 0;
    const byWorkerMap = new Map<
      number,
      { workerId: number; workerName: string; amount: number }
    >();

    for (const dist of distributions) {
      totalTax10 += Number(dist.totalTax10);
      for (const worker of dist.distributions) {
        const existing = byWorkerMap.get(worker.workerId);
        if (existing) {
          existing.amount += Number(worker.amount);
        } else {
          byWorkerMap.set(worker.workerId, {
            workerId: worker.workerId,
            workerName: worker.workerName,
            amount: Number(worker.amount),
          });
        }
      }
    }

    return {
      totalTax10,
      byWorker: Array.from(byWorkerMap.values()),
      distributions,
    };
  }

  /**
   * Obtiene distribuciones de una factura específica
   */
  async getDistributionsByRecord(billingRecordId: number): Promise<{
    tip: TipDistribution | null;
    tax10: Tax10Distribution | null;
  }> {
    const [tip, tax10] = await Promise.all([
      this.tipRepository.findOne({ where: { billingRecordId } }),
      this.tax10Repository.findOne({ where: { billingRecordId } }),
    ]);

    return { tip, tax10 };
  }
}

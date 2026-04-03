import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingRecord } from '../entities/billing-record.entity';
import { ProductsService } from '../../products/products.service';

export interface ConsumptionItem {
  billingItemId: number;
  productId: number;
  quantity: number;
  roomNumber?: string;
  conceptSource?: 'minibar' | 'terraza' | 'alojamiento' | 'other';
}

@Injectable()
export class InventoryConsumptionService {
  constructor(
    @InjectRepository(BillingRecord)
    private readonly billingRecordRepository: Repository<BillingRecord>,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Consume inventario para un registro de facturación completo
   * Usado al crear un BillingRecord
   * @param consumeImmediately - Si true, consume inmediatamente. Si false, marca como pendiente
   */
  async consumeInventoryForRecord(
    recordId: number,
    items: ConsumptionItem[],
    date: string,
    consumeImmediately: boolean = true,
  ): Promise<{
    consumed: number;
    pending: number;
    errors: string[];
  }> {
    let consumed = 0;
    let pending = 0;
    const errors: string[] = [];

    const record = await this.billingRecordRepository.findOne({
      where: { id: recordId },
    });

    for (const item of items) {
      try {
        if (!item.productId) {
          continue;
        }

        if (consumeImmediately) {
          await this.productsService.updateDailyConsumption(
            item.productId,
            date,
            item.quantity,
          );
          consumed++;
        } else {
          pending++;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to consume product ${item.productId}: ${message}`);
      }
    }

    if (record) {
      record.pendingConsumption = !consumeImmediately;
      if (items.length > 0) {
        record.roomNumber = items[0].roomNumber || null;
        record.conceptSource = items[0].conceptSource || 'other';
      }
      await this.billingRecordRepository.save(record);
    }

    return { consumed, pending, errors };
  }

  /**
   * Obtiene todos los registros con consumo pendiente
   */
  async getPendingConsumptionRecords(
    billingId: number,
  ): Promise<BillingRecord[]> {
    return await this.billingRecordRepository.find({
      where: {
        billingId,
        pendingConsumption: true,
      },
      relations: ['payments'],
    });
  }

  /**
   * Consume todos los items pendientes de un billing
   */
  async consumeAllPending(
    billingId: number,
    date: string,
  ): Promise<{
    consumed: number;
    errors: string[];
  }> {
    const pendingRecords = await this.getPendingConsumptionRecords(billingId);
    const errors: string[] = [];

    for (const record of pendingRecords) {
      try {
        record.pendingConsumption = false;
        await this.billingRecordRepository.save(record);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to consume record ${record.id}: ${message}`);
      }
    }

    return {
      consumed: pendingRecords.length - errors.length,
      errors,
    };
  }

  /**
   * Reporte de consumo de inventario por período
   */
  async getInventoryReport(
    from: string,
    to: string,
  ): Promise<any> {
    const records = await this.billingRecordRepository
      .createQueryBuilder('record')
      .where('record.createdAt >= :from', { from })
      .andWhere('record.createdAt <= :to', { to })
      .leftJoinAndSelect('record.productConsumptions', 'consumption')
      .getMany();

    return records;
  }
}

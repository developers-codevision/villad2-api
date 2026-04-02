import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingItem } from '../entities/billing-item.entity';
import { BillingRecord } from '../entities/billing-record.entity';
import { Concept } from '../../concepts/entities/concept.entity';
import { ProductsService } from '../../products/products.service';

export interface ConsumptionItem {
  billingItemId: number;
  conceptId: number;
  quantity: number;
  roomNumber?: string;
  conceptSource?: 'minibar' | 'terraza' | 'alojamiento' | 'other';
}

@Injectable()
export class InventoryConsumptionService {
  constructor(
    @InjectRepository(BillingItem)
    private readonly billingItemRepository: Repository<BillingItem>,
    @InjectRepository(BillingRecord)
    private readonly billingRecordRepository: Repository<BillingRecord>,
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Consume inventario inmediatamente al facturar
   * Se ejecuta si concept.autoConsumeInventory = true
   */
  async consumeInventoryImmediately(
    billingItemId: number,
    date: string,
  ): Promise<void> {
    const billingItem = await this.billingItemRepository.findOne({
      where: { id: billingItemId },
      relations: ['concept'],
    });

    if (!billingItem) {
      throw new NotFoundException(`Billing item with ID ${billingItemId} not found`);
    }

    const concept = billingItem.concept;
    if (!concept || !concept.productId) {
      return; // No hay producto asociado para consumir
    }

    // Consumir del inventario
    await this.productsService.updateDailyConsumption(
      concept.productId,
      date,
      Number(billingItem.quantity),
    );

    // Marcar como consumido
    billingItem.pendingConsumption = false;
    await this.billingItemRepository.save(billingItem);
  }

  /**
   * Marca un item para consumo diferido
   */
  async markForDeferredConsumption(billingItemId: number): Promise<void> {
    const billingItem = await this.billingItemRepository.findOne({
      where: { id: billingItemId },
    });

    if (!billingItem) {
      throw new NotFoundException(`Billing item with ID ${billingItemId} not found`);
    }

    billingItem.pendingConsumption = true;
    await this.billingItemRepository.save(billingItem);
  }

  /**
   * Ejecuta el consumo de inventario pendiente
   * Se llama manualmente cuando se decide descargar el consumo
   */
  async executeDeferredConsumption(
    billingItemId: number,
    date: string,
  ): Promise<void> {
    const billingItem = await this.billingItemRepository.findOne({
      where: { id: billingItemId },
      relations: ['concept'],
    });

    if (!billingItem) {
      throw new NotFoundException(`Billing item with ID ${billingItemId} not found`);
    }

    if (!billingItem.pendingConsumption) {
      throw new NotFoundException('This item is not pending consumption');
    }

    const concept = billingItem.concept;
    if (!concept || !concept.productId) {
      throw new NotFoundException('No product associated with this concept');
    }

    // Consumir del inventario
    await this.productsService.updateDailyConsumption(
      concept.productId,
      date,
      Number(billingItem.quantity),
    );

    // Marcar como consumido
    billingItem.pendingConsumption = false;
    await this.billingItemRepository.save(billingItem);
  }

  /**
   * Consume inventario para un registro de facturación completo
   * Usado al crear un BillingRecord
   */
  async consumeInventoryForRecord(
    recordId: number,
    items: ConsumptionItem[],
    date: string,
  ): Promise<{
    consumed: number;
    pending: number;
    errors: string[];
  }> {
    let consumed = 0;
    let pending = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        const concept = await this.conceptRepository.findOne({
          where: { id: item.conceptId },
        });

        if (!concept || !concept.productId) {
          continue; // No hay producto para consumir
        }

        if (concept.autoConsumeInventory) {
          // Consumir inmediatamente
          await this.productsService.updateDailyConsumption(
            concept.productId,
            date,
            item.quantity,
          );
          consumed++;
        } else {
          // Marcar para consumo diferido
          if (item.billingItemId) {
            await this.markForDeferredConsumption(item.billingItemId);
          }
          pending++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to consume item ${item.conceptId}: ${message}`);
      }
    }

    return { consumed, pending, errors };
  }

  /**
   * Obtiene todos los items con consumo pendiente
   */
  async getPendingConsumptionItems(billingId: number): Promise<BillingItem[]> {
    return await this.billingItemRepository.find({
      where: {
        billingId,
        pendingConsumption: true,
      },
      relations: ['concept'],
    });
  }

  /**
   * Consume todos los items pendientes de un billing
   */
  async consumeAllPending(billingId: number, date: string): Promise<{
    consumed: number;
    errors: string[];
  }> {
    const pendingItems = await this.getPendingConsumptionItems(billingId);
    const errors: string[] = [];

    for (const item of pendingItems) {
      try {
        if (item.concept?.productId) {
          await this.productsService.updateDailyConsumption(
            item.concept.productId,
            date,
            Number(item.quantity),
          );
          item.pendingConsumption = false;
          await this.billingItemRepository.save(item);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to consume item ${item.id}: ${message}`);
      }
    }

    return {
      consumed: pendingItems.length - errors.length,
      errors,
    };
  }
}

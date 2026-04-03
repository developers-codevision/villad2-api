import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillingRecordService } from './services/billing-record.service';
import { BillingPaymentService } from './services/billing-payment.service';
import { TipReportService } from './services/tip-report.service';
import { InventoryConsumptionService } from './services/inventory-consumption.service';
import { BillingReportService } from './services/billing-report.service';
import { Billing } from './entities/billing.entity';
import { BillingItem } from './entities/billing-item.entity';
import { BillingRecord } from './entities/billing-record.entity';
import { BillingPayment } from './entities/billing-payment.entity';
import { TipDistribution } from './entities/tip-distribution.entity';
import { Tax10Distribution } from './entities/tax10-distribution.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Billing,
      BillingItem,
      BillingRecord,
      BillingPayment,
      TipDistribution,
      Tax10Distribution,
      Concept,
      Reservation,
    ]),
    ProductsModule,
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    BillingRecordService,
    BillingPaymentService,
    TipReportService,
    InventoryConsumptionService,
    BillingReportService,
  ],
  exports: [
    BillingService,
    BillingRecordService,
    BillingPaymentService,
    TipReportService,
    InventoryConsumptionService,
    BillingReportService,
  ],
})
export class BillingModule {}

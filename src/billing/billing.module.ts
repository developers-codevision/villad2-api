import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Billing } from './entities/billing.entity';
import { ExtraBilling } from './entities/extra-billing.entity';
import { ExtraBillingItem } from './entities/extra-billing-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Billing, ExtraBilling, ExtraBillingItem])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptsService } from './concepts.service';
import { ConceptsController } from './concepts.controller';
import { Concept } from './entities/concept.entity';
import { BillingItem } from '../billing/entities/billing-item.entity';
import { Billing } from '../billing/entities/billing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Concept, BillingItem, Billing])],
  controllers: [ConceptsController],
  providers: [ConceptsService],
  exports: [ConceptsService],
})
export class ConceptsModule {}

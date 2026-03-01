import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';
import { PaypalClient } from './client/paypal-client';
import { OrderBuilder } from './builders/order-builder';
import { PaymentProcessor } from './processors/payment-processor';
import { WebhookHandler } from './handlers/webhook-handler';
import { PaypalPayment } from './entities/paypal-payment.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaypalPayment, Reservation]),
    ConfigModule,
  ],
  controllers: [PaypalController],
  providers: [
    PaypalService,
    PaypalClient,
    OrderBuilder,
    PaymentProcessor,
    WebhookHandler,
  ],
  exports: [PaypalService],
})
export class PaypalModule {}

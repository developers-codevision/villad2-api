import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaypalPayment } from './entities/paypal-payment.entity';
import { CreatePaypalPaymentDto } from './dto/create-paypal-payment.dto';
import { Reservation } from '../reservations/entities/reservation.entity';
import { PaypalClient } from './client/paypal-client';
import { OrderBuilder } from './builders/order-builder';
import { PaymentProcessor } from './processors/payment-processor';
import { WebhookHandler } from './handlers/webhook-handler';
import {
  PayPalOrderResponse,
  PayPalCaptureResponse,
} from './client/interfaces/paypal-api.interface';

@Injectable()
export class PaypalService {
  constructor(
    @InjectRepository(PaypalPayment)
    private readonly paypalPaymentRepository: Repository<PaypalPayment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly paypalClient: PaypalClient,
    private readonly orderBuilder: OrderBuilder,
    private readonly paymentProcessor: PaymentProcessor,
    private readonly webhookHandler: WebhookHandler,
  ) { }

  async createOrder(
    createPaypalPaymentDto: CreatePaypalPaymentDto,
  ): Promise<{
    orderId: string;
  }> {
    const { reservationId, amount, currency, metadata } = createPaypalPaymentDto;

    const reservation = await this.findReservation(reservationId);

    try {
      const orderRequest = this.orderBuilder.buildOrder({
        reservationId,
        amount,
        currency,
        reservation,
      });

      const order: PayPalOrderResponse = await this.paypalClient.makeRequest(
        '/v2/checkout/orders',
        'POST',
        orderRequest,
      );

      await this.paymentProcessor.createPaymentRecord(
        order.id,
        reservationId,
        amount,
        currency,
        {
          ...metadata,
          reservationNumber: reservation.reservationNumber,
        },
        order,
      );

      return {
        orderId: order.id,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `PayPal order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async capturePayment(orderId: string): Promise<PaypalPayment> {
    try {
      const capture: PayPalCaptureResponse = await this.paypalClient.makeRequest(
        `/v2/checkout/orders/${orderId}/capture`,
        'POST',
        {},
      );

      return await this.paymentProcessor.processCapture(orderId, capture);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `PayPal payment capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getOrderDetails(orderId: string): Promise<unknown> {
    try {
      return await this.paypalClient.makeRequest(
        `/v2/checkout/orders/${orderId}`,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `PayPal order details failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async handleWebhook(webhookEvent: unknown): Promise<void> {
    await this.webhookHandler.handleWebhook(webhookEvent as any);
  }

  async getPaypalPaymentByReservationId(
    reservationId: number,
  ): Promise<PaypalPayment[]> {
    return await this.paypalPaymentRepository.find({
      where: { reservationId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaypalPaymentById(id: number): Promise<PaypalPayment> {
    const paypalPayment = await this.paypalPaymentRepository.findOne({
      where: { id },
      relations: ['reservation'],
    });

    if (!paypalPayment) {
      throw new NotFoundException('PayPal payment not found');
    }

    return paypalPayment;
  }

  private async findReservation(reservationId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['room', 'client'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }
}

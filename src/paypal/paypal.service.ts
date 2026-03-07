import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaypalPayment } from './entities/paypal-payment.entity';
import { CreatePaypalPaymentDto } from './dto/create-paypal-payment.dto';
import { CreatePaypalOrderWithReservationDto } from './dto/create-paypal-order-with-reservation.dto';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservationsService } from '../reservations/reservations.service';
import { PaypalClient } from './client/paypal-client';
import { OrderBuilder } from './builders/order-builder';
import { PaymentProcessor } from './processors/payment-processor';
import { WebhookHandler } from './handlers/webhook-handler';
import {
  PayPalOrderResponse,
  PayPalCaptureResponse,
} from './client/interfaces/paypal-api.interface';
import { CreateReservationDto } from 'src/reservations/dto/create-reservation.dto';
import { ReservationStatus } from '../reservations/entities/reservation.entity';
import { PaymentStatus } from '../payments/entities/payment.entity';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);

  constructor(
    @InjectRepository(PaypalPayment)
    private readonly paypalPaymentRepository: Repository<PaypalPayment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly reservationsService: ReservationsService,
    private readonly paypalClient: PaypalClient,
    private readonly orderBuilder: OrderBuilder,
    private readonly paymentProcessor: PaymentProcessor,
    private readonly webhookHandler: WebhookHandler,
  ) {}

  async createOrderWithReservation(
    createPaypalOrderWithReservationDto: CreateReservationDto,
  ): Promise<{
    orderId: string;
    reservation: Reservation;
  }> {
    console.log(createPaypalOrderWithReservationDto);

    const reservationData = createPaypalOrderWithReservationDto;

    try {
      this.logger.debug(
        `Creating PayPal order with reservation data: ${JSON.stringify(reservationData)}`,
      );

      // Create the reservation first
      const reservation =
        await this.reservationsService.create(reservationData);
      this.logger.debug(`Reservation created with ID: ${reservation.id}`);

      // Give the user 30 minutes to complete the PayPal checkout.
      // If the window expires without a successful capture the cron job will
      // cancel this reservation and unblock the room automatically.
      const PAYMENT_WINDOW_MINUTES = 30;
      const expiresAt = new Date(
        Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000,
      );
      await this.reservationsService.setPaymentExpiry(reservation.id, expiresAt);
      this.logger.debug(
        `Payment expiry set for reservation ${reservation.id}: ${expiresAt.toISOString()}`,
      );

      // Fetch the reservation with room relation for the order builder
      const reservationWithRoom = await this.findReservation(reservation.id);
      if (!reservationWithRoom) {
        throw new NotFoundException('Reservation not found after creation');
      }

      this.logger.debug(
        `Reservation with room loaded. Room: ${reservationWithRoom.room?.name || 'N/A'}, TotalPrice: ${reservationWithRoom.totalPrice}`,
      );

      // Create PayPal order using the calculated total price
      const orderRequest = this.orderBuilder.buildOrder({
        reservationId: reservation.id,
        amount: reservation.totalPrice,
        currency: 'USD',
        reservation: reservationWithRoom,
      });

      const order: PayPalOrderResponse = await this.paypalClient.makeRequest(
        '/v2/checkout/orders',
        'POST',
        orderRequest,
      );

      await this.paymentProcessor.createPaymentRecord(
        order.id,
        reservation.id,
        reservation.totalPrice,
        'USD',
        {
          reservationNumber: reservation.reservationNumber,
        },
        order,
      );

      this.logger.debug(`PayPal order created successfully: ${order.id}`);

      return {
        orderId: order.id,
        reservation,
      };
    } catch (error) {
      this.logger.error(
        `Error creating PayPal order with reservation: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : '',
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `PayPal order creation with reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async capturePayment(orderId: string): Promise<PaypalPayment> {
    try {
      const capture: PayPalCaptureResponse =
        await this.paypalClient.makeRequest(
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

  /**
   * Cancels a PENDING reservation immediately when the user closes/abandons
   * the PayPal popup. Call this from the frontend's onCancel / onError callbacks.
   *
   * - If the reservation is already CONFIRMED (payment captured) it is NOT
   *   cancelled and a ConflictException is thrown instead.
   * - If the order is not found a NotFoundException is thrown.
   */
  async cancelOrder(orderId: string): Promise<{ reservationId: number }> {
    const paypalPayment = await this.paypalPaymentRepository.findOne({
      where: { paypalOrderId: orderId },
      relations: ['reservation'],
    });

    if (!paypalPayment) {
      throw new NotFoundException(
        `PayPal order ${orderId} not found`,
      );
    }

    const reservation = paypalPayment.reservation;

    if (!reservation) {
      throw new NotFoundException(
        `Reservation linked to PayPal order ${orderId} not found`,
      );
    }

    if (reservation.status === ReservationStatus.CONFIRMED) {
      throw new ConflictException(
        `Cannot cancel order ${orderId}: payment has already been captured`,
      );
    }

    // Cancel the reservation so the room is unblocked immediately
    if (reservation.status === ReservationStatus.PENDING) {
      reservation.status = ReservationStatus.CANCELLED;
      await this.reservationRepository.save(reservation);
      this.logger.log(
        `Reservation ${reservation.id} cancelled by user action (PayPal order ${orderId} abandoned)`,
      );
    }

    // Mark the payment record as cancelled
    paypalPayment.status = PaymentStatus.CANCELED;
    await this.paypalPaymentRepository.save(paypalPayment);

    return { reservationId: reservation.id };
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

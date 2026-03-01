import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaypalPayment } from '../entities/paypal-payment.entity';
import { Reservation, ReservationStatus } from '../../reservations/entities/reservation.entity';
import { PaymentStatus } from '../../payments/entities/payment.entity';

export interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id?: string;
    status?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
    status_details?: {
      reason?: string;
    };
  };
  resource_version: string;
  event_version: string;
}

@Injectable()
export class WebhookHandler {
  private readonly logger = new Logger(WebhookHandler.name);

  constructor(
    @InjectRepository(PaypalPayment)
    private readonly paypalPaymentRepository: Repository<PaypalPayment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async handleWebhook(webhookEvent: PayPalWebhookEvent): Promise<void> {
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    this.logger.log(`Processing PayPal webhook: ${eventType}`);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.handlePaymentCaptureCompleted(resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await this.handlePaymentCaptureDenied(resource);
        break;
      case 'PAYMENT.CAPTURE.PENDING':
        await this.handlePaymentCapturePending(resource);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.handlePaymentCaptureRefunded(resource);
        break;
      default:
        this.logger.warn(`Unhandled PayPal webhook event type: ${eventType}`);
    }
  }

  private async handlePaymentCaptureCompleted(resource: PayPalWebhookEvent['resource']): Promise<void> {
    const paypalPayment = await this.findPaypalPaymentByOrderId(
      resource.supplementary_data?.related_ids?.order_id,
    );

    if (paypalPayment) {
      paypalPayment.status = PaymentStatus.SUCCEEDED;
      paypalPayment.paypalPaymentId = resource.id;

      // Note: We don't modify the reservation status here anymore to avoid race conditions
      // with the synchronous capturePayment flow which already handles it.
      await this.paypalPaymentRepository.save(paypalPayment);
      this.logger.log(`Payment capture completed for order ${resource.id}`);
    }
  }

  private async handlePaymentCaptureDenied(resource: PayPalWebhookEvent['resource']): Promise<void> {
    const paypalPayment = await this.findPaypalPaymentByOrderId(
      resource.supplementary_data?.related_ids?.order_id,
    );

    if (paypalPayment) {
      paypalPayment.status = PaymentStatus.FAILED;
      paypalPayment.failureReason =
        resource.status_details?.reason || 'Payment denied';
      await this.paypalPaymentRepository.save(paypalPayment);
      this.logger.log(`Payment capture denied for order ${resource.id}`);
    }
  }

  private async handlePaymentCapturePending(resource: PayPalWebhookEvent['resource']): Promise<void> {
    const paypalPayment = await this.findPaypalPaymentByOrderId(
      resource.supplementary_data?.related_ids?.order_id,
    );

    if (paypalPayment) {
      paypalPayment.status = PaymentStatus.PROCESSING;
      await this.paypalPaymentRepository.save(paypalPayment);
      this.logger.log(`Payment capture pending for order ${resource.id}`);
    }
  }

  private async handlePaymentCaptureRefunded(resource: PayPalWebhookEvent['resource']): Promise<void> {
    const paypalPayment = await this.findPaypalPaymentByOrderId(
      resource.supplementary_data?.related_ids?.order_id,
    );

    if (paypalPayment) {
      paypalPayment.status = PaymentStatus.REFUNDED;
      await this.paypalPaymentRepository.save(paypalPayment);
      this.logger.log(`Payment refunded for order ${resource.id}`);
    }
  }

  private async findPaypalPaymentByOrderId(orderId?: string): Promise<PaypalPayment | null> {
    if (!orderId) {
      return null;
    }

    return await this.paypalPaymentRepository.findOne({
      where: { paypalOrderId: orderId },
      relations: ['reservation'],
    });
  }

  async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string,
  ): Promise<boolean> {
    // TODO: Implement webhook signature verification for production
    // This involves:
    // 1. Get the webhook ID from PayPal API
    // 2. Construct the verification string
    // 3. Calculate the expected signature using your webhook secret
    // 4. Compare with the signature from headers
    this.logger.warn('Webhook signature verification not implemented yet');
    return true; // For now, always return true
  }
}

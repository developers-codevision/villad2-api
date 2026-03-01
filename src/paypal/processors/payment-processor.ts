import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaypalPayment } from '../entities/paypal-payment.entity';
import { Reservation, ReservationStatus } from '../../reservations/entities/reservation.entity';
import { PaymentStatus } from '../../payments/entities/payment.entity';
import { PayPalCaptureResponse } from '../client/interfaces/paypal-api.interface';

@Injectable()
export class PaymentProcessor {
  constructor(
    @InjectRepository(PaypalPayment)
    private readonly paypalPaymentRepository: Repository<PaypalPayment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async processCapture(
    orderId: string,
    captureResponse: PayPalCaptureResponse,
  ): Promise<PaypalPayment> {
    const paypalPayment = await this.findPaypalPayment(orderId);

    this.updatePaymentFromCapture(paypalPayment, captureResponse);

    if (captureResponse.status === 'COMPLETED') {
      await this.confirmReservation(paypalPayment);
    }

    return await this.paypalPaymentRepository.save(paypalPayment);
  }

  private async findPaypalPayment(orderId: string): Promise<PaypalPayment> {
    const paypalPayment = await this.paypalPaymentRepository.findOne({
      where: { paypalOrderId: orderId },
      relations: ['reservation'],
    });

    if (!paypalPayment) {
      throw new NotFoundException('PayPal payment not found');
    }

    return paypalPayment;
  }

  private updatePaymentFromCapture(
    paypalPayment: PaypalPayment,
    captureResponse: PayPalCaptureResponse,
  ): void {
    paypalPayment.status = this.mapPaypalStatusToPaymentStatus(captureResponse.status);
    paypalPayment.paypalPaymentId =
      captureResponse.purchase_units[0]?.payments?.captures[0]?.id;
    paypalPayment.paypalPayerId = captureResponse.payer?.payer_id;
    paypalPayment.paypalResponse = captureResponse;
  }

  private async confirmReservation(paypalPayment: PaypalPayment): Promise<void> {
    if (paypalPayment.reservation) {
      paypalPayment.reservation.status = ReservationStatus.CONFIRMED;
      paypalPayment.reservation.paymentStatus = 'paid';
      await this.reservationRepository.save(paypalPayment.reservation);
    }
  }

  mapPaypalStatusToPaymentStatus(paypalStatus: string): PaymentStatus {
    switch (paypalStatus) {
      case 'COMPLETED':
        return PaymentStatus.SUCCEEDED;
      case 'APPROVED':
        return PaymentStatus.PROCESSING;
      case 'CREATED':
      case 'SAVED':
        return PaymentStatus.PENDING;
      case 'VOIDED':
      case 'DENIED':
        return PaymentStatus.FAILED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  async createPaymentRecord(
    orderId: string,
    reservationId: number,
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
    paypalResponse?: unknown,
  ): Promise<PaypalPayment> {
    const paypalPayment = this.paypalPaymentRepository.create({
      paypalOrderId: orderId,
      reservationId,
      amount,
      currency: currency.toUpperCase(),
      status: PaymentStatus.PENDING,
      metadata,
      paypalResponse,
    });

    return await this.paypalPaymentRepository.save(paypalPayment);
  }

  async updatePaymentStatus(
    paypalPaymentId: number,
    status: PaymentStatus,
    additionalData?: Partial<PaypalPayment>,
  ): Promise<PaypalPayment> {
    const paypalPayment = await this.paypalPaymentRepository.findOne({
      where: { id: paypalPaymentId },
    });

    if (!paypalPayment) {
      throw new NotFoundException('PayPal payment not found');
    }

    paypalPayment.status = status;

    if (additionalData) {
      Object.assign(paypalPayment, additionalData);
    }

    return await this.paypalPaymentRepository.save(paypalPayment);
  }
}

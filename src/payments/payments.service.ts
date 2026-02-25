import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createCheckoutSession(createPaymentDto: CreatePaymentDto): Promise<{
    sessionId: string;
    url: string;
  }> {
    const { reservationId, amount, currency, metadata } = createPaymentDto;

    // Verificar que la reservación existe
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['room', 'client'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Crear Checkout Session en Stripe
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Reservación ${reservation.reservationNumber}`,
              description: `Habitación ${reservation.room?.name || 'N/A'} - ${reservation.checkInDate} a ${reservation.checkOutDate}`,
              images: [],
            },
            unit_amount: Math.round(amount * 100), // Stripe trabaja en centavos
          },
          quantity: 1,
        },
      ],
      metadata: {
        reservationId: reservationId.toString(),
        reservationNumber: reservation.reservationNumber,
        ...metadata,
      },
      success_url: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: reservation.client?.email,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    // Guardar el pago en la base de datos
    const payment = this.paymentRepository.create({
      stripePaymentIntentId: session.id, // Usamos session.id como referencia
      reservationId,
      amount,
      currency: currency.toUpperCase(),
      status: PaymentStatus.PENDING,
      metadata: session.metadata,
    });

    await this.paymentRepository.save(payment);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async confirmCheckoutSession(sessionId: string): Promise<Payment> {
    // Recuperar la sesión de Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    // Buscar el pago en la base de datos
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: sessionId },
      relations: ['reservation'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Actualizar el estado del pago
    payment.status = this.mapStripeSessionStatusToPaymentStatus(session.payment_status);
    payment.stripeChargeId = session.payment_intent as string;

    if (session.payment_status === 'paid') {
      // Actualizar el estado de la reservación
      if (payment.reservation) {
        payment.reservation.status = ReservationStatus.CONFIRMED;
        payment.reservation.stripePaymentIntentId = session.id;
        payment.reservation.paymentStatus = 'paid';
        await this.reservationRepository.save(payment.reservation);
      }
    }

    return await this.paymentRepository.save(payment);
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: session.id },
      relations: ['reservation'],
    });

    if (payment) {
      payment.status = PaymentStatus.SUCCEEDED;
      payment.stripeChargeId = session.payment_intent as string;

      if (payment.reservation) {
        payment.reservation.status = ReservationStatus.CONFIRMED;
        payment.reservation.stripePaymentIntentId = session.id;
        payment.reservation.paymentStatus = 'paid';
        await this.reservationRepository.save(payment.reservation);
      }

      await this.paymentRepository.save(payment);
    }
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: session.id },
    });

    if (payment) {
      payment.status = PaymentStatus.CANCELED;
      await this.paymentRepository.save(payment);
    }
  }

  private mapStripeSessionStatusToPaymentStatus(paymentStatus: string): PaymentStatus {
    switch (paymentStatus) {
      case 'paid':
        return PaymentStatus.SUCCEEDED;
      case 'unpaid':
        return PaymentStatus.PENDING;
      default:
        return PaymentStatus.FAILED;
    }
  }

  async getPaymentByReservationId(reservationId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { reservationId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['reservation'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Reservation } from '../../reservations/entities/reservation.entity';

type PaymentProvider = 'paypal' | 'stripe' | 'zelle' | 'bizum' | 'manual';

interface EmailTask {
  id: string;
  sendFn: () => Promise<void>;
}

@Injectable()
export class EmailNotificationService implements OnModuleDestroy {
  private readonly logger = new Logger(EmailNotificationService.name);
  private readonly transporter: Transporter | null;
  private readonly emailQueue: EmailTask[] = [];
  private isProcessingQueue = false;
  private shouldStop = false;

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.createTransporter();
    this.startQueueProcessor();
  }

  onModuleDestroy() {
    this.shouldStop = true;
    if (this.emailQueue.length > 0) {
      this.logger.warn(
        `Application shutting down with ${this.emailQueue.length} pending emails in queue.`,
      );
    }
  }

  private startQueueProcessor() {
    // Process queue every 100ms
    setInterval(() => {
      this.processQueue().catch((error) => {
        this.logger.error(`Queue processor error: ${error}`);
      });
    }, 100);
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.emailQueue.length > 0 && !this.shouldStop) {
        const task = this.emailQueue.shift();
        if (task) {
          try {
            await task.sendFn();
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : JSON.stringify(error);
            this.logger.error(
              `Failed to send email task ${task.id}: ${errorMessage}`,
            );
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private enqueueEmail(task: Omit<EmailTask, 'id'>): void {
    const id = `email_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.emailQueue.push({ ...task, id });
    this.logger.debug(
      `Email task ${id} added to queue. Queue size: ${this.emailQueue.length}`,
    );
  }

  async sendReservationConfirmedEmail(params: {
    reservation: Reservation;
    paymentProvider: PaymentProvider;
    paymentReference?: string;
  }): Promise<void> {
    const { reservation, paymentProvider, paymentReference } = params;
    const toEmail = reservation.client?.email;

    if (!toEmail) {
      this.logger.warn(
        `Reservation ${reservation.id} has no client email. Reservation confirmation email was skipped.`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Reservation confirmation email was skipped.',
      );
      return;
    }

    // Enqueue email for background processing
    this.enqueueEmail({
      sendFn: async () => {
        const fromEmail =
          this.configService.get<string>('MAIL_FROM') ||
          this.configService.get<string>('SMTP_USER') ||
          'no-reply@localhost';

        const providerLabel = paymentProvider.toUpperCase();
        const guestName =
          `${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim() ||
          'cliente';
        const subject = `Confirmacion de reservacion - ${reservation.reservationNumber}`;
        const text = [
          `Hola ${guestName},`,
          '',
          'Tu reservacion ha sido confirmada.',
          `Numero de reservacion: ${reservation.reservationNumber}`,
          `Habitacion: ${reservation.room?.name ?? reservation.roomId}`,
          `Check-in: ${reservation.checkInDate}`,
          `Check-out: ${reservation.checkOutDate}`,
          `Total: ${reservation.totalPrice}`,
          `Proveedor de pago: ${providerLabel}`,
          paymentReference ? `Referencia de pago: ${paymentReference}` : '',
          '',
          'Gracias por elegirnos.',
        ]
          .filter(Boolean)
          .join('\n');

        await this.transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          text,
        });

        this.logger.log(
          `Reservation confirmation email sent for reservation ${reservation.id} to ${toEmail}.`,
        );
      },
    });
  }

  async sendReservationPendingEmail(params: {
    reservation: Reservation;
    paymentProvider: 'zelle' | 'bizum';
  }): Promise<void> {
    const { reservation, paymentProvider } = params;
    const toEmail = reservation.client?.email;

    if (!toEmail) {
      this.logger.warn(
        `Reservation ${reservation.id} has no client email. Pending reservation notification email was skipped.`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Pending reservation notification email was skipped.',
      );
      return;
    }

    // Enqueue email for background processing
    this.enqueueEmail({
      sendFn: async () => {
        const fromEmail =
          this.configService.get<string>('MAIL_FROM') ||
          this.configService.get<string>('SMTP_USER') ||
          'no-reply@localhost';

        const providerLabel = paymentProvider.toUpperCase();
        const guestName =
          `${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim() ||
          'cliente';

        const subject = `Reservacion pendiente de confirmacion - ${reservation.reservationNumber}`;
        const text = [
          `Hola ${guestName},`,
          '',
          'Tu reservacion ha sido registrada y esta pendiente de confirmacion.',
          `Numero de reservacion: ${reservation.reservationNumber}`,
          `Habitacion: ${reservation.room?.name ?? reservation.roomId}`,
          `Metodo de pago: ${providerLabel}`,
          `Check-in: ${reservation.checkInDate}`,
          `Check-out: ${reservation.checkOutDate}`,
          `Total: ${reservation.totalPrice}`,
          '',
          'Te notificaremos cuando tu reservacion sea confirmada.',
        ].join('\n');

        await this.transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          text,
        });

        this.logger.log(
          `Pending reservation notification email sent for reservation ${reservation.id} to ${toEmail}.`,
        );
      },
    });

    // Also send email to owner for Zelle/Bizum payments
    this.enqueueEmail({
      sendFn: async () => {
        const ownerEmail = this.configService.get<string>('OWNER_EMAIL');
        if (!ownerEmail) {
          this.logger.warn(
            'OWNER_EMAIL is not configured. Owner notification email was skipped.',
          );
          return;
        }

        const fromEmail =
          this.configService.get<string>('MAIL_FROM') ||
          this.configService.get<string>('SMTP_USER') ||
          'no-reply@localhost';

        const providerLabel = paymentProvider.toUpperCase();
        const guestName =
          `${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim() ||
          'cliente';

        const subject = `Nueva reservacion pendiente por ${providerLabel} - ${reservation.reservationNumber}`;
        const text = [
          `Se recibio una nueva reservacion con pago por ${providerLabel}.`,
          '',
          `Metodo de pago: ${providerLabel} (transferencia manual)`,
          `Reserva: ${reservation.reservationNumber} (ID ${reservation.id})`,
          `Habitacion: ${reservation.room?.name ?? reservation.roomId}`,
          `Huesped principal: ${guestName}`,
          `Email huesped: ${reservation.client?.email ?? 'N/A'}`,
          `Telefono huesped: ${reservation.client?.phone ?? 'N/A'}`,
          `Check-in: ${reservation.checkInDate}`,
          `Check-out: ${reservation.checkOutDate}`,
          `Total: ${reservation.totalPrice}`,
          '',
        ].join('\n');

        await this.transporter.sendMail({
          from: fromEmail,
          to: ownerEmail,
          subject,
          text,
        });

        this.logger.log(
          `Owner notification email sent for pending reservation ${reservation.id} to ${ownerEmail}.`,
        );
      },
    });
  }

  async sendGuestReservationConfirmedEmail(params: {
    reservation: Reservation;
  }): Promise<void> {
    const { reservation } = params;
    const toEmail = reservation.client?.email;

    if (!toEmail) {
      this.logger.warn(
        `Reservation ${reservation.id} has no guest email. Guest confirmation email was skipped.`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Guest confirmation email was skipped.',
      );
      return;
    }

    // Enqueue email for background processing
    this.enqueueEmail({
      sendFn: async () => {
        const fromEmail =
          this.configService.get<string>('MAIL_FROM') ||
          this.configService.get<string>('SMTP_USER') ||
          'no-reply@localhost';

        const guestName =
          `${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim() ||
          'cliente';

        const subject = `Confirmacion de reservacion - ${reservation.reservationNumber}`;
        const text = [
          `Hola ${guestName},`,
          '',
          'Tu reservacion ha sido confirmada.',
          `Numero de reservacion: ${reservation.reservationNumber}`,
          `Habitacion: ${reservation.room?.name ?? reservation.roomId}`,
          `Check-in: ${reservation.checkInDate}`,
          `Check-out: ${reservation.checkOutDate}`,
          `Total: ${reservation.totalPrice}`,
          '',
          'Gracias por elegirnos.',
        ].join('\n');

        await this.transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          text,
        });

        this.logger.log(
          `Guest confirmation email sent for reservation ${reservation.id} to ${toEmail}.`,
        );
      },
    });
  }

  private createTransporter(): Transporter | null {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure =
      (
        this.configService.get<string>('SMTP_SECURE') ?? 'false'
      ).toLowerCase() === 'true';

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }
}

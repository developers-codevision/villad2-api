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

interface ReservationEmailDetails {
  reservation: Reservation;
  paymentProvider?: PaymentProvider;
  paymentReference?: string;
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

  /**
   * Generates detailed text for reservation emails including all available information
   */
  private generateReservationDetailsText(
    params: ReservationEmailDetails,
  ): string {
    const { reservation, paymentProvider, paymentReference } = params;
    const lines: string[] = [];

    // Basic reservation info
    lines.push(`Numero de reservacion: ${reservation.reservationNumber}`);
    lines.push(`Habitacion: ${reservation.room?.name ?? reservation.roomId}`);
    lines.push(`Check-in: ${reservation.checkInDate}`);
    lines.push(`Check-out: ${reservation.checkOutDate}`);

    // Guests info
    const totalGuests =
      reservation.baseGuestsCount + reservation.extraGuestsCount;
    lines.push(
      `Huespedes: ${totalGuests} (base: ${reservation.baseGuestsCount}, extra: ${reservation.extraGuestsCount})`,
    );

    // Additional guests details
    if (
      reservation.additionalGuests &&
      reservation.additionalGuests.length > 0
    ) {
      lines.push(`Huespedes adicionales:`);
      reservation.additionalGuests.forEach((guest, index) => {
        lines.push(
          `  ${index + 1}. ${guest.firstName} ${guest.lastName} (${guest.sex})${guest.idNumber ? ` - ID: ${guest.idNumber}` : ''}`,
        );
      });
    }

    // Early check-in / Late check-out
    if (reservation.earlyCheckIn) {
      lines.push(`Early check-in: Si (entrada anticipada)`);
    }
    if (reservation.lateCheckOut) {
      lines.push(`Late check-out: Si (salida tardia)`);
    }

    // Transfers
    if (reservation.transferOneWay || reservation.transferRoundTrip) {
      lines.push(`Transfer:`);
      if (reservation.transferOneWay) {
        lines.push(`  - One way (ida)`);
      }
      if (reservation.transferRoundTrip) {
        lines.push(`  - Round trip (ida y vuelta)`);
      }
    }

    // Breakfasts
    if (reservation.breakfasts > 0) {
      lines.push(`Desayunos: ${reservation.breakfasts}`);
    }

    // Total price
    lines.push(`Total: ${reservation.totalPrice}`);

    // Payment info
    if (paymentProvider) {
      lines.push(`Metodo de pago: ${paymentProvider.toUpperCase()}`);
    }
    if (paymentReference) {
      lines.push(`Referencia de pago: ${paymentReference}`);
    }

    // Notes and observations
    if (reservation.notes) {
      lines.push(`Notas: ${reservation.notes}`);
    }
    if (reservation.observations) {
      lines.push(`Observaciones: ${reservation.observations}`);
    }

    return lines.join('\n');
  }

  /**
   * Generates detailed text for owner notification emails
   */
  private generateOwnerNotificationText(
    params: ReservationEmailDetails & { status: string },
  ): string {
    const { reservation, status } = params;
    const lines: string[] = [];

    const guestName =
      `${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim() ||
      'cliente';

    lines.push(`Estado: ${status}`);
    lines.push(
      `Reserva: ${reservation.reservationNumber} (ID ${reservation.id})`,
    );
    lines.push('');
    lines.push(`=== DATOS DEL HUESPED ===`);
    lines.push(`Huesped principal: ${guestName}`);
    lines.push(`Email huesped: ${reservation.client?.email ?? 'N/A'}`);
    lines.push(`Telefono huesped: ${reservation.client?.phone ?? 'N/A'}`);
    if (reservation.client?.idNumber) {
      lines.push(`Documento ID: ${reservation.client.idNumber}`);
    }
    lines.push('');
    lines.push(`=== DETALLES DE LA RESERVA ===`);
    lines.push(this.generateReservationDetailsText(params));

    return lines.join('\n');
  }

  /**
   * Sends notification email to owner for any payment method
   */
  private sendOwnerNotificationEmail(
    params: ReservationEmailDetails & { status: string },
  ): void {
    const { reservation, paymentProvider, status } = params;

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Owner notification email was skipped.',
      );
      return;
    }

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

        const providerLabel = paymentProvider
          ? ` - ${paymentProvider.toUpperCase()}`
          : '';
        const subject = `Nueva reservacion ${status}${providerLabel} - ${reservation.reservationNumber}`;

        const text = this.generateOwnerNotificationText(params);

        await this.transporter!.sendMail({
          from: fromEmail,
          to: ownerEmail,
          subject,
          text,
        });

        this.logger.log(
          `Owner notification email sent for reservation ${reservation.id} to ${ownerEmail}.`,
        );
      },
    });
  }

  async sendReservationConfirmedEmail(params: {
    reservation: Reservation;
    paymentProvider: PaymentProvider;
    paymentReference?: string;
  }): Promise<void> {
    const { reservation, paymentProvider, paymentReference } = params;
    const toEmail = reservation.client?.email;

    // Always notify owner first, regardless of client email
    this.sendOwnerNotificationEmail({
      ...params,
      status: 'confirmada',
    });

    if (!toEmail) {
      this.logger.warn(
        `Reservation ${reservation.id} has no client email. Client confirmation email was skipped.`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Client confirmation email was skipped.',
      );
      return;
    }

    const transporter = this.transporter;

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
          this.generateReservationDetailsText(params),
          '',
          'Gracias por elegirnos.',
        ].join('\n');

        await transporter.sendMail({
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
    paymentProvider: PaymentProvider;
  }): Promise<void> {
    const { reservation, paymentProvider } = params;
    const toEmail = reservation.client?.email;

    // Always notify owner first, regardless of client email
    this.sendOwnerNotificationEmail({
      ...params,
      status: 'pendiente',
    });

    if (!toEmail) {
      this.logger.warn(
        `Reservation ${reservation.id} has no client email. Client pending notification email was skipped.`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Client pending notification email was skipped.',
      );
      return;
    }

    const transporter = this.transporter;

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

        const subject = `Reservacion pendiente de confirmacion - ${reservation.reservationNumber}`;
        const text = [
          `Hola ${guestName},`,
          '',
          'Tu reservacion ha sido registrada y esta pendiente de confirmacion.',
          this.generateReservationDetailsText(params),
          '',
          'Te notificaremos cuando tu reservacion sea confirmada.',
        ].join('\n');

        await transporter.sendMail({
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
  }

  async sendGuestReservationConfirmedEmail(params: {
    reservation: Reservation;
    paymentProvider?: PaymentProvider;
  }): Promise<void> {
    const { reservation } = params;
    const toEmail = reservation.client?.email;

    // Always notify owner first, regardless of client email
    this.sendOwnerNotificationEmail({
      ...params,
      status: 'confirmada',
    });

    if (!toEmail) {
      this.logger.warn(
        `Reservation ${reservation.id} has no guest email. Client confirmation email was skipped.`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Client confirmation email was skipped.',
      );
      return;
    }

    const transporter = this.transporter;

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
          this.generateReservationDetailsText(params),
          '',
          'Gracias por elegirnos.',
        ].join('\n');

        await transporter.sendMail({
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

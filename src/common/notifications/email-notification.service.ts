import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Reservation } from '../../reservations/entities/reservation.entity';

type PaymentProvider = 'paypal' | 'stripe' | 'zelle' | 'bizum' | 'manual';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.createTransporter();
  }

  async sendReservationConfirmedEmail(params: {
    reservation: Reservation;
    paymentProvider: PaymentProvider;
    paymentReference?: string;
  }): Promise<void> {
    const toEmail = this.configService.get<string>('NOTIFICATION_TO_EMAIL');

    if (!toEmail) {
      this.logger.warn(
        'NOTIFICATION_TO_EMAIL is not configured. Reservation notification email was skipped.',
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Reservation notification email was skipped.',
      );
      return;
    }

    const fromEmail =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'no-reply@localhost';

    const { reservation, paymentProvider, paymentReference } = params;
    const providerLabel = paymentProvider.toUpperCase();
    const subject = `Nueva reservacion confirmada por ${providerLabel} - ${reservation.reservationNumber}`;
    const text = [
      'Se confirmo una reservacion en el sistema.',
      `Proveedor de pago: ${providerLabel}`,
      `Reserva: ${reservation.reservationNumber} (ID ${reservation.id})`,
      `Habitacion: ${reservation.room?.name ?? reservation.roomId}`,
      `Huesped principal: ${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim(),
      `Email huesped: ${reservation.client?.email ?? 'N/A'}`,
      `Check-in: ${reservation.checkInDate}`,
      `Check-out: ${reservation.checkOutDate}`,
      `Total: ${reservation.totalPrice}`,
      paymentReference ? `Referencia de pago: ${paymentReference}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await this.transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        text,
      });

      this.logger.log(
        `Reservation notification email sent for reservation ${reservation.id} to ${toEmail}.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to send reservation notification email: ${errorMessage}`,
      );
    }
  }

  async sendReservationPendingEmail(params: {
    reservation: Reservation;
    paymentProvider: 'zelle' | 'bizum';
  }): Promise<void> {
    const toEmail = this.configService.get<string>('NOTIFICATION_TO_EMAIL');

    console.log(
      'Attempting to send pending reservation email. NOTIFICATION_TO_EMAIL:',
      toEmail,
    );
    if (!toEmail) {
      this.logger.warn(
        'NOTIFICATION_TO_EMAIL is not configured. Pending reservation notification email was skipped.',
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        'SMTP configuration is incomplete. Pending reservation notification email was skipped.',
      );
      return;
    }

    const fromEmail =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'no-reply@localhost';

    const { reservation, paymentProvider } = params;
    const providerLabel = paymentProvider.toUpperCase();

    const subject = `Nueva reservacion pendiente por ${providerLabel} - ${reservation.reservationNumber}`;
    const text = [
      'Se registro una reservacion pendiente de confirmacion manual.',
      `Metodo de pago: ${providerLabel}`,
      `Reserva: ${reservation.reservationNumber} (ID ${reservation.id})`,
      `Habitacion: ${reservation.room?.name ?? reservation.roomId}`,
      `Huesped principal: ${reservation.client?.firstName ?? ''} ${reservation.client?.lastName ?? ''}`.trim(),
      `Email huesped: ${reservation.client?.email ?? 'N/A'}`,
      `Check-in: ${reservation.checkInDate}`,
      `Check-out: ${reservation.checkOutDate}`,
      `Total: ${reservation.totalPrice}`,
    ].join('\n');

    try {
      await this.transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        text,
      });

      this.logger.log(
        `Pending reservation notification email sent for reservation ${reservation.id} to ${toEmail}.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to send pending reservation notification email: ${errorMessage}`,
      );
    }
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

    try {
      await this.transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        text,
      });

      this.logger.log(
        `Guest confirmation email sent for reservation ${reservation.id} to ${toEmail}.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to send guest confirmation email: ${errorMessage}`,
      );
    }
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

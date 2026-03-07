import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationsService } from './reservations.service';

/**
 * Periodically cancels PENDING reservations whose payment window has expired.
 *
 * Flow:
 *  1. User fills reservation form → reservation is created with status PENDING
 *     and paymentExpiresAt = now + 30 min.
 *  2. If the user completes PayPal checkout → status becomes CONFIRMED.
 *  3. If the user abandons the PayPal popup → this cron cancels the reservation
 *     after the expiry window, unblocking the room for other guests.
 */
@Injectable()
export class ReservationCleanupService {
  private readonly logger = new Logger(ReservationCleanupService.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredReservations(): Promise<void> {
    try {
      const cancelled =
        await this.reservationsService.cancelExpiredPendingReservations();

      if (cancelled > 0) {
        this.logger.log(
          `Cancelled ${cancelled} expired PENDING reservation(s) due to incomplete payment.`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error while cancelling expired reservations',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

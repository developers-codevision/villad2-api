import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reservation } from '../../reservations/entities/reservation.entity';

export interface PayPalOrderRequest {
  intent: 'CAPTURE';
  purchase_units: Array<{
    reference_id: string;
    description: string;
    amount: {
      currency_code: string;
      value: string;
    };
    custom_id: string;
  }>;
  application_context: {
    brand_name: string;
    landing_page?: 'BILLING' | 'LOGIN' | 'NO_ACCOUNT' | 'SIGNUP';
    shipping_preference:
      | 'GET_FROM_FILE'
      | 'NO_SHIPPING'
      | 'SET_PROVIDED_ADDRESS';
    user_action: 'CONTINUE' | 'PAY_NOW';
    return_url?: string;
    cancel_url?: string;
  };
}

export interface OrderBuilderOptions {
  reservationId: number;
  amount: number;
  currency: string;
  reservation: Reservation;
}

@Injectable()
export class OrderBuilder {
  constructor(private readonly configService: ConfigService) {}

  buildOrder(options: OrderBuilderOptions): PayPalOrderRequest {
    this.validateOrderOptions(options);
    const { reservationId, amount, currency, reservation } = options;

    return {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: reservationId.toString(),
          description: this.buildDescription(reservation),
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          custom_id: reservation.reservationNumber,
        },
      ],
      application_context: {
        brand_name: 'Hostal CodeVision',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };
  }

  private buildDescription(reservation: Reservation): string {
    if (!reservation) {
      throw new BadRequestException('Reservation is required to build description');
    }
    if (!reservation.roomId) {
      throw new BadRequestException(
        'Reservation must have a roomId to build order description',
      );
    }
    const roomName = reservation.room?.name || `Room ${reservation.roomId}`;
    return `Reservación ${reservation.reservationNumber} - Habitación ${roomName}`;
  }

  validateOrderOptions(options: OrderBuilderOptions): void {
    if (!options) {
      throw new BadRequestException('Order options are required');
    }

    if (!options.reservationId) {
      throw new BadRequestException('Reservation ID is required');
    }

    if (options.amount === undefined || options.amount === null || options.amount <= 0) {
      throw new BadRequestException('Amount must be a positive number greater than 0');
    }

    if (!options.currency || options.currency.length !== 3) {
      throw new BadRequestException('Currency must be a valid 3-letter code (e.g., USD)');
    }

    if (!options.reservation) {
      throw new BadRequestException('Reservation data is required');
    }

    if (!options.reservation.roomId) {
      throw new BadRequestException(
        'Reservation must have a roomId - ensure the reservation was created with a valid room',
      );
    }
  }
}

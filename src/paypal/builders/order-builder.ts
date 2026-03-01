import { Injectable } from '@nestjs/common';
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
    shipping_preference: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
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
  constructor(private readonly configService: ConfigService) { }

  buildOrder(options: OrderBuilderOptions): PayPalOrderRequest {
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
    const roomName = reservation.room?.name || 'N/A';
    return `Reservación ${reservation.reservationNumber} - Habitación ${roomName}`;
  }

  validateOrderOptions(options: OrderBuilderOptions): void {
    if (!options.reservationId) {
      throw new Error('Reservation ID is required');
    }

    if (!options.amount || options.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!options.currency || options.currency.length !== 3) {
      throw new Error('Currency must be a valid 3-letter code');
    }

    if (!options.reservation) {
      throw new Error('Reservation data is required');
    }
  }
}

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PayPalTokenResponse,
  PayPalErrorResponse,
} from './interfaces/paypal-api.interface';

@Injectable()
export class PaypalClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    this.environment = this.configService.get<string>(
      'PAYPAL_ENVIRONMENT',
      'sandbox',
    );

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials are not defined');
    }

    this.baseUrl =
      this.environment === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to get PayPal access token');
    }

    const data: PayPalTokenResponse = await response.json();
    return data.access_token;
  }

  async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData: PayPalErrorResponse = await response.json();
      throw new BadRequestException(
        `PayPal API request failed: ${JSON.stringify(errorData)}`,
      );
    }

    return response.json();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }
}

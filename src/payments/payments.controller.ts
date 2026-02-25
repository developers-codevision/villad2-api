import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  Headers,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Crear una sesión de checkout de Stripe' })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async createCheckoutSession(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<{
    sessionId: string;
    url: string;
  }> {
    return await this.paymentsService.createCheckoutSession(createPaymentDto);
  }

  @Post('confirm-checkout-session')
  @ApiOperation({ summary: 'Confirmar una sesión de checkout' })
  @ApiResponse({ status: 200, description: 'Checkout session confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmCheckoutSession(@Body() body: { sessionId: string }) {
    return await this.paymentsService.confirmCheckoutSession(body.sessionId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de Stripe para notificaciones de pago' })
  async handleStripeWebhook(
    @Body() event: any,
    @Headers('stripe-signature') signature: string,
    @Res() response: Response,
  ): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET is not configured');
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      return;
    }

    try {
      // Aquí deberías verificar la firma del webhook
      // const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
      
      await this.paymentsService.handleWebhook(event);
      response.status(HttpStatus.OK).send();
    } catch (error) {
      this.logger.error('Webhook error:', error);
      response.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Obtener pagos de una reservación' })
  @ApiParam({ name: 'reservationId', description: 'ID de la reservación' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPaymentsByReservationId(@Param('reservationId') reservationId: number) {
    return await this.paymentsService.getPaymentByReservationId(reservationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id') id: number) {
    return await this.paymentsService.getPaymentById(id);
  }
}

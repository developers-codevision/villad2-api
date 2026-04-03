import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaypalService } from './paypal.service';
import { CreateReservationDto } from 'src/reservations/dto/create-reservation.dto';

@ApiTags('paypal')
@Controller('paypal')
export class PaypalController {
  private readonly logger = new Logger(PaypalController.name);

  constructor(private readonly paypalService: PaypalService) {}
  @Post('create-order-with-reservation')
  @ApiOperation({ summary: 'Create PayPal order with reservation data' })
  @ApiResponse({
    status: 201,
    description: 'PayPal order created successfully with reservation',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrderWithReservation(@Body() dto: CreateReservationDto) {
    try {
      console.log(dto);
      const result = await this.paypalService.createOrderWithReservation(dto);
      return {
        success: true,
        data: result,
        message: 'PayPal order and reservation created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create PayPal order with reservation: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  @Post('cancel-order/:orderId')
  @ApiOperation({
    summary: 'Cancel a pending PayPal order and free the reserved room',
    description:
      'Call this from the PayPal SDK onCancel / onError callbacks so the room is unblocked immediately instead of waiting for the expiry cron job.',
  })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'PayPal order not found' })
  @ApiResponse({
    status: 409,
    description: 'Payment already captured, cannot cancel',
  })
  async cancelOrder(@Param('orderId') orderId: string) {
    try {
      const result = await this.paypalService.cancelOrder(orderId);
      return {
        success: true,
        data: result,
        message: 'Order cancelled and room unblocked successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to cancel PayPal order ${orderId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  @Post('capture-payment/:orderId')
  @ApiOperation({ summary: 'Capture PayPal payment' })
  @ApiResponse({ status: 200, description: 'Payment captured successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'PayPal payment not found' })
  async capturePayment(@Param('orderId') orderId: string) {
    try {
      const result = await this.paypalService.capturePayment(orderId);
      return {
        success: true,
        data: result,
        message: 'Payment captured successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to capture PayPal payment: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get PayPal order details' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getOrderDetails(@Param('orderId') orderId: string) {
    try {
      const result = await this.paypalService.getOrderDetails(orderId);
      return {
        success: true,
        data: result,
        message: 'Order details retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get PayPal order details: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  @Get('payment/reservation/:reservationId')
  @ApiOperation({ summary: 'Get PayPal payments by reservation ID' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPaymentsByReservationId(
    @Param('reservationId') reservationId: number,
  ) {
    try {
      const result =
        await this.paypalService.getPaypalPaymentByReservationId(reservationId);
      return {
        success: true,
        data: result,
        message: 'Payments retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get PayPal payments for reservation ${reservationId}: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
      throw error;
    }
  }

  @Get('payment/:id')
  @ApiOperation({ summary: 'Get PayPal payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'PayPal payment not found' })
  async getPaymentById(@Param('id') id: number) {
    try {
      const result = await this.paypalService.getPaypalPaymentById(id);
      return {
        success: true,
        data: result,
        message: 'Payment retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get PayPal payment ${id}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle PayPal webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('paypal-auth-algo') authAlgo: string,
    @Headers('paypal-transmission-id') transmissionId: string,
    @Headers('paypal-cert-id') certId: string,
    @Headers('paypal-transmission-sig') transmissionSig: string,
    @Headers('paypal-transmission-time') transmissionTime: string,
    @Body() webhookEvent: any,
  ) {
    try {
      // TODO: Implement webhook signature verification for production
      // For now, we'll process the webhook directly

      await this.paypalService.handleWebhook(webhookEvent);

      this.logger.log(`PayPal webhook processed: ${webhookEvent.event_type}`);

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to process PayPal webhook: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw new BadRequestException('Webhook processing failed');
    }
  }
}

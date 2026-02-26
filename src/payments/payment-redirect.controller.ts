import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('payment-redirect')
@Controller('payment')
export class PaymentRedirectController {
  constructor(private readonly configService: ConfigService) {}

  @Get('success')
  @ApiOperation({ summary: 'Redirección después de pago exitoso' })
  @ApiQuery({ name: 'session_id', required: true, description: 'ID de la sesión de Stripe' })
  async paymentSuccess(
    @Query('session_id') sessionId: string,
    @Res() response: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    
    // Redirigir al frontend con el session_id
    response.redirect(
      HttpStatus.MOVED_PERMANENTLY,
      `${frontendUrl}/payment/success?session_id=${sessionId}`
    );
  }

  @Get('cancel')
  @ApiOperation({ summary: 'Redirección después de pago cancelado' })
  @ApiQuery({ name: 'session_id', required: true, description: 'ID de la sesión de Stripe' })
  async paymentCancel(
    @Query('session_id') sessionId: string,
    @Res() response: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    
    // Redirigir al frontend con el session_id
    response.redirect(
      HttpStatus.MOVED_PERMANENTLY,
      `${frontendUrl}/payment/cancel?session_id=${sessionId}`
    );
  }
}

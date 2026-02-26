import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Inject,
  forwardRef,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { PaymentType } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({
    status: 201,
    description: 'Reservation created',
    type: Reservation,
  })
  @ApiBody({ type: CreateReservationDto })
  create(@Body() dto: CreateReservationDto): Promise<Reservation> {
    return this.reservationsService.create(dto);
  }

  @Post('with-payment')
  @ApiOperation({ summary: 'Create reservation with payment checkout' })
  @ApiResponse({
    status: 201,
    description: 'Reservation created with payment session',
  })
  async createWithPayment(@Body() dto: CreateReservationDto): Promise<{
    reservation: Reservation;
    paymentSession: {
      sessionId: string;
      url: string;
    };
  }> {
    // Crear la reservación primero
    const reservation = await this.reservationsService.create(dto);

    // Crear sesión de checkout para el pago
    const paymentSession = await this.paymentsService.createCheckoutSession({
      reservationId: reservation.id,
      amount: reservation.totalPrice,
      currency: 'usd', // o configurable
      type: PaymentType.RESERVATION,
    });

    return {
      reservation,
      paymentSession,
    };
  }

  @Get('session-status')
  @ApiOperation({ summary: 'Get Stripe checkout session status' })
  @ApiResponse({
    status: 200,
    description: 'Session status retrieved successfully',
  })
  async getSessionStatus(@Query('session_id') sessionId: string) {
    const session = await this.paymentsService.retrieveCheckoutSession(sessionId, {
      expand: ['payment_intent'],
    });

    return {
      status: session.status,
      payment_status: session.payment_status,
      payment_intent_id: typeof session.payment_intent === 'object' 
        ? session.payment_intent?.id 
        : session.payment_intent,
      payment_intent_status: typeof session.payment_intent === 'object' 
        ? session.payment_intent?.status 
        : undefined,
    };
  }

  @Get('occupied-dates')
  @ApiOperation({ summary: 'Get all occupied dates from confirmed and pending reservations grouped by room ID' })
  @ApiResponse({
    status: 200,
    description: 'Object with room IDs as keys and arrays of occupied dates as values',
    type: 'object',
  })
  getOccupiedDates(): Promise<{ [roomId: number]: string[] }> {
    return this.reservationsService.getOccupiedDatesByRoom();
  }

  @Get('occupied-dates/:roomId')
  @ApiOperation({ summary: 'Get occupied dates for a specific room from confirmed and pending reservations' })
  @ApiResponse({
    status: 200,
    description: 'Array of occupied dates for the specified room sorted in ascending order',
    type: [String],
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  getOccupiedDatesByRoom(@Param('roomId', ParseIntPipe) roomId: number): Promise<string[]> {
    return this.reservationsService.getOccupiedDatesByRoomId(roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation found',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reservation> {
    return this.reservationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiResponse({
    status: 200,
    description: 'Reservation updated',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 1 })
  @ApiBody({ type: UpdateReservationDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation deleted' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 1 })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true }> {
    await this.reservationsService.remove(id);
    return { success: true };
  }
}

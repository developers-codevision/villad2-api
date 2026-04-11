import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Put,
  Inject,
  forwardRef,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  ReservationStatus as ReservationStatusDto,
} from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  FindReservationsDto,
  PaginatedReservationsResponse,
} from './dto/find-reservations.dto';
import { HourRange } from './dto/occupied-hours.dto';
import { CheckInDto, CheckOutDto } from './dto/check-in.dto';
import { PaymentType } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import {
  CreateReservationWithPaymentDto,
  ReservationPaymentMethod,
} from './dto/create-reservation-with-payment.dto';
import { ReservationType } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { PaypalService } from '../paypal/paypal.service';
import { EmailNotificationService } from '../common/notifications/email-notification.service';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Reservas')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => PaypalService))
    private readonly paypalService: PaypalService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
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
    description:
      'Reservation created and processed according to payment method',
  })
  async createWithPayment(
    @Body() dto: CreateReservationWithPaymentDto,
  ): Promise<{
    reservation: Reservation;
    paymentMethod: ReservationPaymentMethod;
    paymentSession?: {
      sessionId: string;
      url: string;
    };
    paypalOrder?: {
      orderId: string;
    };
  }> {
    console.log('This is the dto', dto);

    if (dto.paymentMethod === ReservationPaymentMethod.PAYPAL) {
      const paypalDto: CreateReservationDto = {
        ...dto,
        status: ReservationStatusDto.PENDING,
      };

      const result =
        await this.paypalService.createOrderWithReservation(paypalDto);

      return {
        reservation: result.reservation,
        paymentMethod: ReservationPaymentMethod.PAYPAL,
        paypalOrder: {
          orderId: result.orderId,
        },
      };
    }

    const currency = dto.currency ?? 'usd';

    if (dto.paymentMethod === ReservationPaymentMethod.STRIPE) {
      const stripeDto: CreateReservationDto = {
        ...dto,
        status: ReservationStatusDto.PENDING,
      };

      const reservation = await this.reservationsService.create(stripeDto);

      // Stripe reservations share the same expiry behavior as PayPal.
      const PAYMENT_WINDOW_MINUTES = 30;
      const expiresAt = new Date(
        Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000,
      );
      await this.reservationsService.setPaymentExpiry(
        reservation.id,
        expiresAt,
      );

      const paymentSession = await this.paymentsService.createCheckoutSession({
        reservationId: reservation.id,
        amount: reservation.totalPrice,
        currency,
        type: PaymentType.RESERVATION,
        stripeCustomerId: dto.stripeCustomerId,
      });

      return {
        reservation,
        paymentMethod: ReservationPaymentMethod.STRIPE,
        paymentSession,
      };
    }

    if (
      dto.paymentMethod === ReservationPaymentMethod.ZELLE ||
      dto.paymentMethod === ReservationPaymentMethod.BIZUM
    ) {
      const pendingDto: CreateReservationDto = {
        ...dto,
        status: ReservationStatusDto.PENDING,
      };
      const reservation = await this.reservationsService.create(pendingDto);

      console.log(
        'Reservation creada with pending status for manual payment. ID:',
        reservation.id,
      );

      const reservationWithRelations = await this.reservationsService.findOne(
        reservation.id,
      );
      // Email is now sent asynchronously (non-blocking background queue)
      this.emailNotificationService.sendReservationPendingEmail({
        reservation: reservationWithRelations,
        paymentProvider: dto.paymentMethod,
      });

      return {
        reservation: reservationWithRelations,
        paymentMethod: dto.paymentMethod,
      };
    }

    const manualDto: CreateReservationDto = {
      ...dto,
      status: ReservationStatusDto.CONFIRMED,
    };
    const reservation = await this.reservationsService.create(manualDto);
    const reservationWithRelations = await this.reservationsService.findOne(
      reservation.id,
    );

    // Email is now sent asynchronously (non-blocking background queue)
    this.emailNotificationService.sendGuestReservationConfirmedEmail({
      reservation: reservationWithRelations,
    });

    return {
      reservation: reservationWithRelations,
      paymentMethod: ReservationPaymentMethod.MANUAL,
    };
  }

  @Get('session-status')
  @ApiOperation({ summary: 'Get Stripe checkout session status' })
  @ApiResponse({
    status: 200,
    description: 'Session status retrieved successfully',
  })
  async getSessionStatus(@Query('session_id') sessionId: string) {
    const session = await this.paymentsService.retrieveCheckoutSession(
      sessionId,
      {
        expand: ['payment_intent'],
      },
    );

    return {
      status: session.status,
      payment_status: session.payment_status,
      payment_intent_id:
        typeof session.payment_intent === 'object'
          ? session.payment_intent?.id
          : session.payment_intent,
      payment_intent_status:
        typeof session.payment_intent === 'object'
          ? session.payment_intent?.status
          : undefined,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all reservations with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reservations',
    type: PaginatedReservationsResponse,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: 'string',
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'reservationNumber',
    required: false,
    type: 'string',
    description: 'Reservation number',
  })
  @ApiQuery({
    name: 'roomId',
    required: false,
    type: 'number',
    description: 'Room ID',
  })
  @ApiQuery({
    name: 'clientEmail',
    required: false,
    type: 'string',
    description: 'Client email',
  })
  @ApiQuery({
    name: 'clientName',
    required: false,
    type: 'string',
    description: 'Client name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    description: 'Reservation status',
  })
  @ApiQuery({
    name: 'checkInDateFrom',
    required: false,
    type: 'string',
    description: 'Check-in date from (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'checkInDateTo',
    required: false,
    type: 'string',
    description: 'Check-in date to (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'checkOutDateFrom',
    required: false,
    type: 'string',
    description: 'Check-out date from (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'checkOutDateTo',
    required: false,
    type: 'string',
    description: 'Check-out date to (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: 'number',
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: 'number',
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'earlyCheckIn',
    required: false,
    type: 'boolean',
    description: 'Early check-in',
  })
  @ApiQuery({
    name: 'lateCheckOut',
    required: false,
    type: 'boolean',
    description: 'Late check-out',
  })
  async findWithFilters(
    @Query() filters: FindReservationsDto,
  ): Promise<PaginatedReservationsResponse> {
    return this.reservationsService.findWithFilters(filters);
  }

  @Get('occupied-hours/:roomId')
  @ApiOperation({ summary: 'Get occupied hours by day for a specific room' })
  @ApiResponse({
    status: 200,
    description: 'Array of occupied hour ranges',
    type: [HourRange],
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'End date (YYYY-MM-DD)',
  })
  getOccupiedHoursByRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<HourRange[]> {
    return this.reservationsService.getOccupiedHoursByRoom(
      roomId,
      startDate,
      endDate,
    );
  }

  @Get('occupied-hours')
  @ApiOperation({ summary: 'Get occupied hours by day for all rooms' })
  @ApiResponse({
    status: 200,
    description:
      'Object with room IDs as keys and arrays of days with occupied hour ranges',
    type: 'object',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'End date (YYYY-MM-DD)',
  })
  getAllRoomsOccupiedHours(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ [roomId: number]: HourRange[] }> {
    return this.reservationsService.getAllRoomsOccupiedHours(
      startDate,
      endDate,
    );
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiResponse({
    status: 200,
    description: 'Reservation status updated',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 1 })
  @ApiBody({ type: UpdateReservationStatusDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
    return this.reservationsService.updateStatus(id, dto.status);
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

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check-in a reservation' })
  @ApiResponse({
    status: 200,
    description: 'Reservation checked in successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 409, description: 'Reservation cannot be checked in' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 1 })
  checkIn(@Param('id', ParseIntPipe) id: number): Promise<Reservation> {
    return this.reservationsService.checkIn(id);
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Check-out a reservation' })
  @ApiResponse({
    status: 200,
    description: 'Reservation checked out successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({
    status: 409,
    description: 'Reservation cannot be checked out',
  })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 1 })
  @ApiBody({ type: CheckOutDto, required: false })
  checkOut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CheckOutDto,
  ): Promise<Reservation> {
    return this.reservationsService.checkOut(id, dto.roomStatus);
  }

  // ==================== TERRACE RESERVATIONS ====================

  @Post('terrace')
  @ApiOperation({ summary: 'Create a new terrace reservation' })
  @ApiResponse({
    status: 201,
    description: 'Terrace reservation created successfully',
    type: Reservation,
  })
  @ApiBody({ type: CreateReservationDto })
  createTerraceReservation(
    @Body() dto: CreateReservationDto,
  ): Promise<Reservation> {
    // Force type to be TERRACE for this endpoint
    const terraceDto = { ...dto, type: ReservationType.TERRACE };
    return this.reservationsService.create(terraceDto);
  }

  @Get('terrace')
  @ApiOperation({ summary: 'Get all terrace reservations' })
  @ApiResponse({
    status: 200,
    description: 'List of terrace reservations',
    type: [Reservation],
  })
  async findAllTerraceReservations(): Promise<Reservation[]> {
    const allReservations = await this.reservationsService.findAll();
    return allReservations.filter((r) => r.type === ReservationType.TERRACE);
  }

  @Get('terrace/:id')
  @ApiOperation({ summary: 'Get a terrace reservation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Terrace reservation found',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Terrace reservation not found' })
  @ApiParam({ name: 'id', description: 'Terrace Reservation ID', example: 1 })
  async findOneTerraceReservation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Reservation> {
    const reservation = await this.reservationsService.findOne(id);
    if (reservation.type !== ReservationType.TERRACE) {
      throw new NotFoundException(
        `Terrace reservation with ID ${id} not found`,
      );
    }
    return reservation;
  }
}

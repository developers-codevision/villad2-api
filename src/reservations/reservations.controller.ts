import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

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

  @Get()
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiResponse({
    status: 200,
    description: 'List reservations',
    type: [Reservation],
  })
  findAll(): Promise<Reservation[]> {
    return this.reservationsService.findAll();
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

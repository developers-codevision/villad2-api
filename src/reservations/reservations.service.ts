import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { RoomStatus } from '../rooms/enums/room-enums.enum';
import { Client, ClientSex } from './entities/client.entity';
import { Reservation, ReservationStatus, ReservationType } from './entities/reservation.entity';
import { Payment } from '../payments/entities/payment.entity';
import {
  CreateReservationDto,
  GuestSex,
  ReservationStatus as ReservationStatusDto,
  ReservationType as ReservationTypeDto,
} from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  FindReservationsDto,
  PaginatedReservationsResponse,
} from './dto/find-reservations.dto';
import { HourRange } from './dto/occupied-hours.dto';
import { SettingsService } from '../settings/settings.service';
import { EmailNotificationService } from '../common/notifications/email-notification.service';

function mapSexToClientSex(sex: GuestSex): ClientSex {
  return sex as unknown as ClientSex;
}

function mapStatusToEntity(
  status: ReservationStatusDto | undefined,
): ReservationStatus | undefined {
  return status as unknown as ReservationStatus | undefined;
}

function generateReservationNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `R-${y}${m}${d}-${rand}`;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly settingsService: SettingsService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  private parseDateTimeString(dateStr: string): Date {
    // Formato esperado: YYYY-MM-DDTHH:mm:ss
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  async create(dto: CreateReservationDto): Promise<Reservation> {
    // Determinar tipo de reserva
    const reservationType = dto.type ?? ReservationType.ROOM;

    if (reservationType === ReservationType.TERRACE) {
      return this.createTerraceReservation(dto);
    }

    return this.createRoomReservation(dto);
  }

  private async createRoomReservation(dto: CreateReservationDto): Promise<Reservation> {
    const room = await this.roomRepository.findOne({
      where: { id: dto.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
    }

    // Capacity validation: total guests must not exceed room capacity
    const totalGuests = dto.baseGuestsCount + (dto.extraGuestsCount ?? 0);
    const maxCapacity = room.baseCapacity + room.extraCapacity;
    if (totalGuests > maxCapacity) {
      throw new ConflictException(
        `Total guests (${totalGuests}) exceed room capacity (${maxCapacity}).`,
      );
    }

    // Adjust check-in and check-out times based on early/late flags
    const adjustedCheckInDate = this.adjustCheckInTimeString(
      dto.checkInDate,
      dto.earlyCheckIn ?? false,
    );
    const adjustedCheckOutDate = this.adjustCheckOutTimeString(
      dto.checkOutDate,
      dto.lateCheckOut ?? false,
    );

    // Check for conflicting reservations
    await this.validateNoConflictingReservations(
      dto.roomId,
      adjustedCheckInDate,
      adjustedCheckOutDate,
    );

    const client = this.clientRepository.create({
      firstName: dto.mainGuest.firstName,
      lastName: dto.mainGuest.lastName,
      sex: mapSexToClientSex(dto.mainGuest.sex),
      email: dto.mainGuest.email,
      phone: dto.mainGuest.phone,
      idNumber: dto.mainGuest.idNumber,
    });
    const savedClient = await this.clientRepository.save(client);

    // Get current prices from settings
    const prices = await this.settingsService.getPrices();

    // Calculate total price using adjusted dates
    const checkInTime = new Date(adjustedCheckInDate).getTime();
    const checkOutTime = new Date(adjustedCheckOutDate).getTime();
    const nights = Math.ceil(
      (checkOutTime - checkInTime) / (1000 * 60 * 60 * 24),
    );
    if (nights <= 0) {
      throw new ConflictException(
        'Check-out date must be after check-in date.',
      );
    }
    const basePrice = nights * room.pricePerNight;
    const extraGuestsCharge =
      nights * (dto.extraGuestsCount ?? 0) * room.extraGuestCharge;

    // Use dynamic prices from settings
    const transferCharge =
      (dto.transferOneWay ? prices.transferOneWayPrice : 0) +
      (dto.transferRoundTrip ? prices.transferRoundTripPrice : 0);
    const breakfastsCharge = (dto.breakfasts ?? 0) * prices.breakfastPrice;

    // Add early check-in and late check-out charges if applicable
    const additionalCharges =
      (dto.earlyCheckIn ? prices.earlyCheckInPrice : 0) +
      (dto.lateCheckOut ? prices.lateCheckOutPrice : 0);

    const totalPrice =
      basePrice +
      extraGuestsCharge +
      transferCharge +
      breakfastsCharge +
      additionalCharges;

    const reservation = this.reservationRepository.create({
      reservationNumber: generateReservationNumber(),
      roomId: dto.roomId,
      clientId: savedClient.id,
      checkInDate: adjustedCheckInDate,
      checkOutDate: adjustedCheckOutDate,
      status: mapStatusToEntity(dto.status) ?? ReservationStatus.PENDING,
      type: ReservationType.ROOM,
      baseGuestsCount: dto.baseGuestsCount,
      extraGuestsCount: dto.extraGuestsCount ?? 0,
      notes: dto.notes,
      observations: dto.observations,
      additionalGuests: dto.additionalGuests,
      earlyCheckIn: dto.earlyCheckIn ?? false,
      lateCheckOut: dto.lateCheckOut ?? false,
      transferOneWay: dto.transferOneWay ?? false,
      transferRoundTrip: dto.transferRoundTrip ?? false,
      breakfasts: dto.breakfasts ?? 0,
      totalPrice,
    });

    return this.reservationRepository.save(reservation);
  }

  private async createTerraceReservation(dto: CreateReservationDto): Promise<Reservation> {
    // Para terraza, checkInDate debe incluir la hora en formato ISO (ej: 2026-03-30T14:00:00)
    const checkInDate = dto.checkInDate;
    const hoursCount = dto.hoursCount ?? 4;

    // Calcular checkOutDate con la hora de fin
    const checkOutDate = this.calculateCheckOutDate(checkInDate, hoursCount);

    // Verificar disponibilidad usando checkInDate y checkOutDate
    await this.validateNoConflictingTerraceReservations(
      checkInDate,
      checkOutDate,
    );

    // Crear cliente para la reserva de terraza
    const client = this.clientRepository.create({
      firstName: dto.mainGuest?.firstName ?? 'Terraza',
      lastName: dto.mainGuest?.lastName ?? 'Reserva',
      sex: dto.mainGuest?.sex ? mapSexToClientSex(dto.mainGuest.sex) : ClientSex.OTHER,
      email: dto.mainGuest?.email,
      phone: dto.mainGuest?.phone,
      idNumber: dto.mainGuest?.idNumber,
    });
    const savedClient = await this.clientRepository.save(client);

    // Generar número de reserva para terraza
    const reservationNumber = this.generateTerraceReservationNumber();

    const reservation = this.reservationRepository.create({
      reservationNumber,
      roomId: null, // Las reservas de terraza no tienen habitación asignada
      clientId: savedClient.id,
      checkInDate,
      checkOutDate,
      status: mapStatusToEntity(dto.status) ?? ReservationStatus.PENDING,
      type: ReservationType.TERRACE,
      baseGuestsCount: dto.baseGuestsCount ?? dto.peopleCount ?? 1,
      extraGuestsCount: 0,
      hoursCount,
      notes: dto.notes,
      observations: dto.observations,
      totalPrice: dto.totalPrice ?? dto.price ?? 100,
    });

    return this.reservationRepository.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      relations: {
        room: true,
        client: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findWithFilters(
    filters: FindReservationsDto,
  ): Promise<PaginatedReservationsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'DESC',
      reservationNumber,
      roomId,
      clientEmail,
      clientName,
      status,
      checkInDateFrom,
      checkInDateTo,
      checkOutDateFrom,
      checkOutDateTo,
      minPrice,
      maxPrice,
      earlyCheckIn,
      lateCheckOut,
    } = filters;

    // Build query conditions
    const queryBuilder = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('reservation.client', 'client');

    // Apply filters
    if (reservationNumber) {
      queryBuilder.andWhere(
        'reservation.reservationNumber LIKE :reservationNumber',
        {
          reservationNumber: `%${reservationNumber}%`,
        },
      );
    }

    if (roomId) {
      queryBuilder.andWhere('reservation.roomId = :roomId', { roomId });
    }

    if (clientEmail) {
      queryBuilder.andWhere('client.email LIKE :clientEmail', {
        clientEmail: `%${clientEmail}%`,
      });
    }

    if (clientName) {
      queryBuilder.andWhere(
        '(client.firstName LIKE :clientName OR client.lastName LIKE :clientName OR CONCAT(client.firstName, " ", client.lastName) LIKE :clientName)',
        { clientName: `%${clientName}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('reservation.status = :status', { status });
    }

    if (checkInDateFrom) {
      queryBuilder.andWhere('reservation.checkInDate >= :checkInDateFrom', {
        checkInDateFrom,
      });
    }

    if (checkInDateTo) {
      queryBuilder.andWhere('reservation.checkInDate <= :checkInDateTo', {
        checkInDateTo,
      });
    }

    if (checkOutDateFrom) {
      queryBuilder.andWhere('reservation.checkOutDate >= :checkOutDateFrom', {
        checkOutDateFrom,
      });
    }

    if (checkOutDateTo) {
      queryBuilder.andWhere('reservation.checkOutDate <= :checkOutDateTo', {
        checkOutDateTo,
      });
    }

    if (minPrice) {
      queryBuilder.andWhere('reservation.totalPrice >= :minPrice', {
        minPrice,
      });
    }

    if (maxPrice) {
      queryBuilder.andWhere('reservation.totalPrice <= :maxPrice', {
        maxPrice,
      });
    }

    if (earlyCheckIn !== undefined) {
      queryBuilder.andWhere('reservation.earlyCheckIn = :earlyCheckIn', {
        earlyCheckIn,
      });
    }

    if (lateCheckOut !== undefined) {
      queryBuilder.andWhere('reservation.lateCheckOut = :lateCheckOut', {
        lateCheckOut,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting and pagination
    const validSortFields = [
      'id',
      'reservationNumber',
      'checkInDate',
      'checkOutDate',
      'totalPrice',
      'status',
      'createdAt',
      'updatedAt',
    ];

    const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
    queryBuilder.orderBy(`reservation.${sortField}`, sortOrder);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Get results
    const reservations = await queryBuilder.getMany();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      reservations,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrevious,
    };
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: {
        room: true,
        client: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(id: number, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);
    const previousStatus = reservation.status;

    let roomChanged = false;
    if (dto.roomId !== undefined) {
      const room = await this.roomRepository.findOne({
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
      }
      reservation.roomId = dto.roomId;
      roomChanged = true;
    }

    let dateOrFlagChanged = false;

    if (dto.checkInDate !== undefined) {
      reservation.checkInDate = dto.checkInDate;
      dateOrFlagChanged = true;
    }
    if (dto.checkOutDate !== undefined) {
      reservation.checkOutDate = dto.checkOutDate;
      dateOrFlagChanged = true;
    }

    if (dto.status !== undefined) {
      reservation.status = mapStatusToEntity(dto.status) ?? reservation.status;
    }

    if (dto.baseGuestsCount !== undefined) {
      reservation.baseGuestsCount = dto.baseGuestsCount;
    }

    if (dto.extraGuestsCount !== undefined) {
      reservation.extraGuestsCount = dto.extraGuestsCount;
    }

    if (dto.notes !== undefined) {
      reservation.notes = dto.notes;
    }

    if (dto.observations !== undefined) {
      reservation.observations = dto.observations;
    }

    if (dto.additionalGuests !== undefined) {
      reservation.additionalGuests = dto.additionalGuests
        .filter(guest => guest.firstName && guest.lastName && guest.sex)
        .map(guest => ({
          firstName: guest.firstName!,
          lastName: guest.lastName!,
          sex: guest.sex!,
        }));
    }

    if (dto.earlyCheckIn !== undefined) {
      reservation.earlyCheckIn = dto.earlyCheckIn;
      dateOrFlagChanged = true;
    }

    if (dto.lateCheckOut !== undefined) {
      reservation.lateCheckOut = dto.lateCheckOut;
      dateOrFlagChanged = true;
    }

    // Adjust times if dates or early/late flags changed
    if (dateOrFlagChanged) {
      reservation.checkInDate = this.adjustCheckInTimeString(
        reservation.checkInDate,
        reservation.earlyCheckIn,
      );
      reservation.checkOutDate = this.adjustCheckOutTimeString(
        reservation.checkOutDate,
        reservation.lateCheckOut,
      );
    }

    // Check for conflicting reservations if room or dates changed
    if (roomChanged || dateOrFlagChanged) {
      await this.validateNoConflictingReservationsForUpdate(
        id,
        reservation.roomId,
        reservation.checkInDate,
        reservation.checkOutDate,
      );
    }

    if (dto.transferOneWay !== undefined) {
      reservation.transferOneWay = dto.transferOneWay;
    }

    if (dto.transferRoundTrip !== undefined) {
      reservation.transferRoundTrip = dto.transferRoundTrip;
    }

    if (dto.breakfasts !== undefined) {
      reservation.breakfasts = dto.breakfasts;
    }

    // Recalculate total price if room, dates, extra guests, transfers, or breakfasts changed
    if (
      roomChanged ||
      dateOrFlagChanged ||
      dto.extraGuestsCount !== undefined ||
      dto.transferOneWay !== undefined ||
      dto.transferRoundTrip !== undefined ||
      dto.breakfasts !== undefined
    ) {
      const room = await this.roomRepository.findOne({
        where: { id: reservation.roomId },
      });
      if (!room) {
        throw new NotFoundException(
          `Room with ID ${reservation.roomId} not found`,
        );
      }

      // Get current prices from settings
      const prices = await this.settingsService.getPrices();

      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (nights <= 0) {
        throw new ConflictException(
          'Check-out date must be after check-in date.',
        );
      }
      const basePrice = nights * room.pricePerNight;
      const extraGuestsCharge =
        nights * reservation.extraGuestsCount * room.extraGuestCharge;

      // Use dynamic prices from settings
      const transferCharge =
        (reservation.transferOneWay ? prices.transferOneWayPrice : 0) +
        (reservation.transferRoundTrip ? prices.transferRoundTripPrice : 0);
      const breakfastsCharge = reservation.breakfasts * prices.breakfastPrice;

      // Add early check-in and late check-out charges if applicable
      const additionalCharges =
        (reservation.earlyCheckIn ? prices.earlyCheckInPrice : 0) +
        (reservation.lateCheckOut ? prices.lateCheckOutPrice : 0);

      reservation.totalPrice =
        basePrice +
        extraGuestsCharge +
        transferCharge +
        breakfastsCharge +
        additionalCharges;
    }

    if (dto.mainGuest !== undefined) {
      const client = await this.clientRepository.findOne({
        where: { id: reservation.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${reservation.clientId} not found`,
        );
      }

      client.firstName = dto.mainGuest.firstName ?? client.firstName;
      client.lastName = dto.mainGuest.lastName ?? client.lastName;
      client.sex =
        dto.mainGuest.sex !== undefined
          ? mapSexToClientSex(dto.mainGuest.sex)
          : client.sex;
      client.email = dto.mainGuest.email ?? client.email;
      client.phone = dto.mainGuest.phone ?? client.phone;
      await this.clientRepository.save(client);
    }

    const savedReservation = await this.reservationRepository.save(reservation);

    if (
      previousStatus !== ReservationStatus.CONFIRMED &&
      savedReservation.status === ReservationStatus.CONFIRMED
    ) {
      const reservationWithRelations = await this.findOne(savedReservation.id);
      await this.emailNotificationService.sendGuestReservationConfirmedEmail({
        reservation: reservationWithRelations,
      });
    }

    return savedReservation;
  }

  async updateStatus(
    id: number,
    status: ReservationStatusDto,
  ): Promise<Reservation> {
    return this.update(id, { status });
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);

    // Primero eliminar pagos asociados a la reserva
    await this.paymentRepository.delete({ reservationId: reservation.id });

    // Luego eliminar la reserva
    await this.reservationRepository.delete(reservation.id);

    // Finalmente eliminar el cliente (si no tiene otras reservas)
    const otherReservations = await this.reservationRepository.findOne({
      where: { clientId: reservation.clientId },
    });

    if (!otherReservations) {
      await this.clientRepository.delete(reservation.clientId);
    }
  }

  async getOccupiedDates(): Promise<string[]> {
    const reservations = await this.reservationRepository.find({
      where: [
        { status: ReservationStatus.CONFIRMED },
        { status: ReservationStatus.PENDING },
      ],
      select: ['checkInDate', 'checkOutDate', 'status', 'paymentExpiresAt'],
    });

    const occupiedDates = new Set<string>();

    reservations.filter((r) => !this.isExpiredPending(r)).forEach((reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);

      // Include check-in date but exclude check-out date
      for (
        let d = new Date(checkIn);
        d < checkOut;
        d.setDate(d.getDate() + 1)
      ) {
        occupiedDates.add(d.toISOString().split('T')[0]);
      }
    });

    return Array.from(occupiedDates).sort();
  }

  async getOccupiedDatesByRoom(): Promise<{ [roomId: number]: string[] }> {
    const reservations = await this.reservationRepository.find({
      where: [
        { status: ReservationStatus.CONFIRMED },
        { status: ReservationStatus.PENDING },
      ],
      select: ['roomId', 'checkInDate', 'checkOutDate', 'status', 'paymentExpiresAt'],
    });

    const occupiedDatesByRoom: { [roomId: number]: Set<string> } = {};

    reservations.filter((r) => !this.isExpiredPending(r)).forEach((reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);

      if (!occupiedDatesByRoom[reservation.roomId]) {
        occupiedDatesByRoom[reservation.roomId] = new Set<string>();
      }

      // Include check-in date but exclude check-out date
      for (
        let d = new Date(checkIn);
        d < checkOut;
        d.setDate(d.getDate() + 1)
      ) {
        occupiedDatesByRoom[reservation.roomId].add(
          d.toISOString().split('T')[0],
        );
      }
    });

    // Convert Sets to sorted arrays
    const result: { [roomId: number]: string[] } = {};
    Object.keys(occupiedDatesByRoom).forEach((roomId) => {
      result[parseInt(roomId)] = Array.from(
        occupiedDatesByRoom[parseInt(roomId)],
      ).sort();
    });

    return result;
  }

  async getOccupiedDatesByRoomId(roomId: number): Promise<string[]> {
    const reservations = await this.reservationRepository.find({
      where: [
        { status: ReservationStatus.CONFIRMED, roomId },
        { status: ReservationStatus.PENDING, roomId },
      ],
      select: ['checkInDate', 'checkOutDate', 'status', 'paymentExpiresAt'],
    });

    const occupiedDates = new Set<string>();

    reservations.filter((r) => !this.isExpiredPending(r)).forEach((reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);

      // Include check-in date but exclude check-out date
      for (
        let d = new Date(checkIn);
        d < checkOut;
        d.setDate(d.getDate() + 1)
      ) {
        occupiedDates.add(d.toISOString().split('T')[0]);
      }
    });

    return Array.from(occupiedDates).sort();
  }

  async getOccupiedHoursByRoom(
    roomId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<HourRange[]> {
    const reservations = await this.reservationRepository.find({
      where: [
        { status: ReservationStatus.CONFIRMED, roomId },
        { status: ReservationStatus.PENDING, roomId },
      ],
      select: ['checkInDate', 'checkOutDate', 'earlyCheckIn', 'lateCheckOut', 'status', 'paymentExpiresAt'],
      order: { checkInDate: 'ASC' },
    });

    // Exclude PENDING reservations whose payment window has already expired
    const activeReservations = reservations.filter((r) => !this.isExpiredPending(r));

    if (activeReservations.length === 0) {
      return [];
    }

    // Filtrar por rango de fechas si se proporcionan
    let filteredReservations = activeReservations;
    if (startDate && endDate) {
      filteredReservations = activeReservations.filter((reservation) => {
        const checkIn = this.parseDateTimeString(reservation.checkInDate);
        const checkOut = this.parseDateTimeString(reservation.checkOutDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return checkIn <= end && checkOut >= start;
      });
    }

    const result: HourRange[] = [];

    filteredReservations.forEach((reservation) => {
      const checkIn = this.parseDateTimeString(reservation.checkInDate);
      const checkOut = this.parseDateTimeString(reservation.checkOutDate);

      // Formatear fechas completas con horas
      const startDateTime = `${checkIn.toISOString().split('T')[0]}T${String(checkIn.getHours()).padStart(2, '0')}:${String(checkIn.getMinutes()).padStart(2, '0')}`;
      const endDateTime = `${checkOut.toISOString().split('T')[0]}T${String(checkOut.getHours()).padStart(2, '0')}:${String(checkOut.getMinutes()).padStart(2, '0')}`;

      result.push({
        start: startDateTime,
        end: endDateTime,
      });
    });

    return result;
  }

  async getAllRoomsOccupiedHours(
    startDate?: string,
    endDate?: string,
  ): Promise<{ [roomId: number]: HourRange[] }> {
    const rooms = await this.roomRepository.find({
      select: ['id'],
    });

    const result: { [roomId: number]: HourRange[] } = {};

    for (const room of rooms) {
      result[room.id] = await this.getOccupiedHoursByRoom(
        room.id,
        startDate,
        endDate,
      );
    }

    return result;
  }

  /**
   * Returns true when a PENDING reservation's payment window has already expired
   * and it hasn't been cleaned up by the cron job yet.
   * Such reservations should be invisible to availability queries.
   */
  private isExpiredPending(
    reservation: Pick<Reservation, 'status' | 'paymentExpiresAt'>,
  ): boolean {
    return (
      reservation.status === ReservationStatus.PENDING &&
      !!reservation.paymentExpiresAt &&
      reservation.paymentExpiresAt < new Date()
    );
  }

  /**
   * Adjusts check-in time based on early check-in flag
   * If earlyCheckIn is true, sets time to 12:00 (noon)
   * Otherwise, keeps the original time
   */
  private adjustCheckInTimeString(
    dateStr: string,
    earlyCheckIn: boolean,
  ): string {
    if (!earlyCheckIn) {
      return dateStr;
    }

    // Parse the ISO string and adjust hours
    const date = new Date(dateStr);
    date.setHours(12, 0, 0, 0);

    // Return as ISO string without timezone conversion
    return this.dateToISOString(date);
  }

  /**
   * Adjusts check-out time based on late check-out flag
   * If lateCheckOut is true, sets time to 16:00 (4:00 PM)
   * Otherwise, keeps the original time
   */
  private adjustCheckOutTimeString(
    dateStr: string,
    lateCheckOut: boolean,
  ): string {
    if (!lateCheckOut) {
      return dateStr;
    }

    // Parse the ISO string and adjust hours
    const date = new Date(dateStr);
    date.setHours(16, 0, 0, 0);

    // Return as ISO string without timezone conversion
    return this.dateToISOString(date);
  }

  /**
   * Converts a Date to ISO string format (local time, not UTC)
   */
  private dateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Checks if two date strings are on the same day
   */
  private isSameDateString(date1Str: string, date2Str: string): boolean {
    const date1 = date1Str.split('T')[0]; // Extract YYYY-MM-DD
    const date2 = date2Str.split('T')[0]; // Extract YYYY-MM-DD
    return date1 === date2;
  }

  /**
   * Validates that there are no conflicting reservations for the same room
   * A conflict exists when:
   * - Room is the same
   * - Status is PENDING or CONFIRMED
   * - Date ranges overlap (including same day conflicts)
   */
  private async validateNoConflictingReservations(
    roomId: number,
    checkInDate: string,
    checkOutDate: string,
  ): Promise<void> {
    const conflictingReservations = await this.reservationRepository.find({
      where: [
        { status: ReservationStatus.PENDING, roomId },
        { status: ReservationStatus.CONFIRMED, roomId },
      ],
      select: ['id', 'checkInDate', 'checkOutDate', 'status'],
    });

    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);

    for (const reservation of conflictingReservations) {
      const existingCheckIn = new Date(reservation.checkInDate);
      const existingCheckOut = new Date(reservation.checkOutDate);

      // Check if date ranges overlap
      // Overlap occurs if: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
      if (
        (newCheckIn <= existingCheckOut && newCheckIn >= existingCheckIn) ||
        (newCheckOut >= existingCheckIn && newCheckOut <= existingCheckOut)
      ) {
        throw new ConflictException(
          `Room ${roomId} is already reserved from ${existingCheckIn.toISOString()} to ${existingCheckOut.toISOString()}. ` +
            `Requested dates ${checkInDate} to ${checkOutDate} conflict with existing reservation.`,
        );
      }
    }
  }

  /**
   * Validates that there are no conflicting reservations for the same room during update
   * Excludes the current reservation being updated from the conflict check
   */
  private async validateNoConflictingReservationsForUpdate(
    reservationId: number,
    roomId: number,
    checkInDate: string,
    checkOutDate: string,
  ): Promise<void> {
    const conflictingReservations = await this.reservationRepository.find({
      where: [
        { status: ReservationStatus.PENDING, roomId },
        { status: ReservationStatus.CONFIRMED, roomId },
      ],
      select: ['id', 'checkInDate', 'checkOutDate', 'status', 'paymentExpiresAt'],
    });

    const now = new Date();
    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);

    for (const reservation of conflictingReservations) {
      // Skip the current reservation being updated
      if (reservation.id === reservationId) {
        continue;
      }

      // Skip PENDING reservations whose payment window has already expired
      if (
        reservation.status === ReservationStatus.PENDING &&
        reservation.paymentExpiresAt &&
        reservation.paymentExpiresAt < now
      ) {
        continue;
      }

      const existingCheckIn = new Date(reservation.checkInDate);
      const existingCheckOut = new Date(reservation.checkOutDate);

      // Check if date ranges overlap
      // Overlap occurs if: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
      if (
        (newCheckIn <= existingCheckOut && newCheckIn >= existingCheckIn) ||
        (newCheckOut >= existingCheckIn && newCheckOut <= existingCheckOut)
      ) {
        throw new ConflictException(
          `Room ${roomId} is already reserved from ${existingCheckIn.toISOString()} to ${existingCheckOut.toISOString()}. ` +
            `Requested dates ${checkInDate} to ${checkOutDate} conflict with existing reservation.`,
        );
      }
    }
  }

  async checkIn(reservationId: number): Promise<Reservation> {
    const reservation = await this.findOne(reservationId);

    // Validate reservation status
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new ConflictException(
        `Cannot check-in reservation with status ${reservation.status}. Only confirmed reservations can be checked in.`,
      );
    }

    // Update room status to occupied
    const room = await this.roomRepository.findOne({
      where: { id: reservation.roomId },
    });
    if (!room) {
      throw new NotFoundException(
        `Room with ID ${reservation.roomId} not found`,
      );
    }

    room.status = RoomStatus.OCUPADA;
    await this.roomRepository.save(room);

    return this.reservationRepository.save(reservation);
  }

  async checkOut(
    reservationId: number,
    roomStatus?: RoomStatus,
  ): Promise<Reservation> {
    const reservation = await this.findOne(reservationId);

    // Validate reservation status
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new ConflictException(
        `Cannot check-out reservation with status ${reservation.status}. Only finished reservations can be checked out.`,
      );
    }

    reservation.status = ReservationStatus.FINISHED;
    await this.reservationRepository.save(reservation);

    // Update room status
    const room = await this.roomRepository.findOne({
      where: { id: reservation.roomId },
    });
    if (!room) {
      throw new NotFoundException(
        `Room with ID ${reservation.roomId} not found`,
      );
    }

    // Use provided room status or default to VACIA_SUCIA
    room.status = roomStatus || RoomStatus.VACIA_SUCIA;
    await this.roomRepository.save(room);

    // Reservation is already in FINISHED status, keep it that way
    return reservation;
  }

  /**
   * Sets a deadline by which a PENDING reservation's payment must be completed.
   * Call this immediately after creating a PayPal / Stripe order.
   */
  async setPaymentExpiry(
    reservationId: number,
    expiresAt: Date,
  ): Promise<void> {
    await this.reservationRepository.update(reservationId, {
      paymentExpiresAt: expiresAt,
    });
  }

  /**
   * Cancels every PENDING reservation whose payment window has expired.
   * Intended to be called by a periodic cron job.
   * Returns the number of reservations cancelled.
   */
  async cancelExpiredPendingReservations(): Promise<number> {
    const result = await this.reservationRepository.update(
      {
        status: ReservationStatus.PENDING,
        paymentExpiresAt: LessThan(new Date()),
      },
      { status: ReservationStatus.CANCELLED },
    );
    return result.affected ?? 0;
  }

  /**
   * Extrae la hora (HH:mm) de un string de fecha ISO
   */
  private extractTimeFromDateString(dateStr: string): string {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Calcula el checkOutDate basado en checkInDate y hoursCount
   */
  private calculateCheckOutDate(checkInDate: string, hoursCount: number): string {
    const startDate = new Date(checkInDate);
    const endDate = new Date(startDate.getTime() + hoursCount * 60 * 60 * 1000);
    return this.dateToISOString(endDate);
  }

  /**
   * Calcula la hora de fin basada en la hora de inicio y cantidad de horas
   */
  private calculateEndTime(startTime: string, hoursCount: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + hoursCount;
    const endMinutes = minutes;

    // Formatear hora de fin (HH:mm)
    const formattedHour = String(endHour).padStart(2, '0');
    const formattedMinutes = String(endMinutes).padStart(2, '0');

    return `${formattedHour}:${formattedMinutes}`;
  }

  /**
   * Genera un número de reserva único para terraza
   */
  private generateTerraceReservationNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `T-${y}${m}${d}-${rand}`;
  }

  /**
   * Valida que no haya reservaciones de terraza conflictivas
   * Una reservación conflictiva existe cuando:
   * - Misma fecha
   * - Rangos de hora se solapan
   * - Tipo es TERRACE
   */
  private async validateNoConflictingTerraceReservations(
    checkInDate: string,
    checkOutDate: string,
  ): Promise<void> {
    const reservationDate = checkInDate.split('T')[0];

    const conflictingReservations = await this.reservationRepository.find({
      where: [
        {
          status: ReservationStatus.PENDING,
          type: ReservationType.TERRACE,
          checkInDate: reservationDate,
        },
        {
          status: ReservationStatus.CONFIRMED,
          type: ReservationType.TERRACE,
          checkInDate: reservationDate,
        },
      ],
      select: ['id', 'checkInDate', 'checkOutDate', 'status'],
    });

    const newStart = new Date(checkInDate).getTime();
    const newEnd = new Date(checkOutDate).getTime();

    for (const reservation of conflictingReservations) {
      const existingStart = new Date(reservation.checkInDate).getTime();
      const existingEnd = new Date(reservation.checkOutDate).getTime();

      // Verificar solapamiento de horarios
      // Solapamiento ocurre si: nuevoInicio < existenteFin AND nuevoFin > existenteInicio
      if (newStart < existingEnd && newEnd > existingStart) {
        throw new ConflictException(
          `La terraza ya tiene una reservación el ${reservationDate} ` +
            `de ${this.extractTimeFromDateString(reservation.checkInDate)} a ${this.extractTimeFromDateString(reservation.checkOutDate)}. ` +
            `El horario solicitado se solapa con la reservación existente.`,
        );
      }
    }
  }

  /**
   * Convierte hora en formato HH:mm a minutos desde medianoche
   */
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

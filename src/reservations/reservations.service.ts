import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { Client, ClientSex } from './entities/client.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import {
  CreateReservationDto,
  GuestSex,
  ReservationStatus as ReservationStatusDto,
} from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

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
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const room = await this.roomRepository.findOne({
      where: { id: dto.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
    }

    // Early/late check-in/out conflict validation
    if (dto.earlyCheckIn) {
      const conflict = await this.reservationRepository.findOne({
        where: {
          roomId: dto.roomId,
          checkOutDate: dto.checkInDate,
          lateCheckOut: true,
        },
      });
      if (conflict) {
        throw new ConflictException(
          'Early check-in conflicts with another reservation that has late check-out on the same date.',
        );
      }
    }

    if (dto.lateCheckOut) {
      const conflict = await this.reservationRepository.findOne({
        where: {
          roomId: dto.roomId,
          checkInDate: dto.checkOutDate,
          earlyCheckIn: true,
        },
      });
      if (conflict) {
        throw new ConflictException(
          'Late check-out conflicts with another reservation that has early check-in on the same date.',
        );
      }
    }

    const client = this.clientRepository.create({
      firstName: dto.mainGuest.firstName,
      lastName: dto.mainGuest.lastName,
      sex: mapSexToClientSex(dto.mainGuest.sex),
      email: dto.mainGuest.email,
      phone: dto.mainGuest.phone,
    });
    const savedClient = await this.clientRepository.save(client);

    const reservation = this.reservationRepository.create({
      reservationNumber: generateReservationNumber(),
      roomId: dto.roomId,
      clientId: savedClient.id,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      status: mapStatusToEntity(dto.status) ?? ReservationStatus.PENDING,
      baseGuestsCount: dto.baseGuestsCount,
      extraGuestsCount: dto.extraGuestsCount ?? 0,
      notes: dto.notes,
      additionalGuests: dto.additionalGuests,
      earlyCheckIn: dto.earlyCheckIn ?? false,
      lateCheckOut: dto.lateCheckOut ?? false,
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

    if (dto.roomId !== undefined) {
      const room = await this.roomRepository.findOne({
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
      }
      reservation.roomId = dto.roomId;
    }

    if (dto.checkInDate !== undefined) {
      reservation.checkInDate = dto.checkInDate;
    }
    if (dto.checkOutDate !== undefined) {
      reservation.checkOutDate = dto.checkOutDate;
    }

    if (dto.status !== undefined) {
      reservation.status = mapStatusToEntity(dto.status) ?? reservation.status;
    }

    if (dto.baseGuestsCount !== undefined)
      reservation.baseGuestsCount = dto.baseGuestsCount;

    if (dto.extraGuestsCount !== undefined)
      reservation.extraGuestsCount = dto.extraGuestsCount;

    if (dto.notes !== undefined) {
      reservation.notes = dto.notes;
    }

    if (dto.additionalGuests !== undefined) {
      reservation.additionalGuests = dto.additionalGuests;
    }

    if (dto.earlyCheckIn !== undefined) {
      reservation.earlyCheckIn = dto.earlyCheckIn;
    }

    if (dto.lateCheckOut !== undefined) {
      reservation.lateCheckOut = dto.lateCheckOut;
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

    return this.reservationRepository.save(reservation);
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.delete(reservation.id);
    await this.clientRepository.delete(reservation.clientId);
  }
}

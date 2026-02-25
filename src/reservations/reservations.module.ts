import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../rooms/entities/room.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Client } from './entities/client.entity';
import { Reservation } from './entities/reservation.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Client, Room]),
    PaymentsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}

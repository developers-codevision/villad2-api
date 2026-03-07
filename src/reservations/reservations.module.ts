import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../rooms/entities/room.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationCleanupService } from './reservation-cleanup.service';
import { Client } from './entities/client.entity';
import { Reservation } from './entities/reservation.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsModule } from '../payments/payments.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Client, Room, Payment]),
    PaymentsModule,
    SettingsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationCleanupService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

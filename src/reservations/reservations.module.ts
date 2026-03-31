import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../rooms/entities/room.entity';
import { ReservationsController } from './reservations.controller';
import { ClientsController } from './clients.controller';
import { ReservationsService } from './reservations.service';
import { ClientsService } from './clients.service';
import { ReservationCleanupService } from './reservation-cleanup.service';
import { Client } from './entities/client.entity';
import { Reservation } from './entities/reservation.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsModule } from '../payments/payments.module';
import { SettingsModule } from '../settings/settings.module';
import { PaypalModule } from '../paypal/paypal.module';
import { NotificationsModule } from '../common/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Client, Room, Payment]),
    PaymentsModule,
    SettingsModule,
    NotificationsModule,
    forwardRef(() => PaypalModule),
  ],
  controllers: [ReservationsController, ClientsController],
  providers: [ReservationsService, ClientsService, ReservationCleanupService],
  exports: [ReservationsService, ClientsService],
})
export class ReservationsModule {}

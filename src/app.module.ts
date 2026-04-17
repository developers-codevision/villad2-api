import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PromotionsModule } from './promotions/promotions.module';
import { PaypalModule } from './paypal/paypal.module';
import { SettingsModule } from './settings/settings.module';
import { ProductFamiliesModule } from './product-families/product-families.module';
import { ProductsModule } from './products/products.module';
import { BillingModule } from './billing/billing.module';
import { ConceptsModule } from './concepts/concepts.module';
import { StaffModule } from './staff/staff.module';
import { DailyAttendanceModule } from './daily-attendance/daily-attendance.module';
import { SalaryModule } from './salary/salary.module';
import { VacationModule } from './vacation/vacation.module';
import { AbsenceModule } from './absence/absence.module';
import { IpvModule } from './ipv/ipv.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST', 'localhost'),
        port: +configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        synchronize: false,
        logging: true,
      }),
    }),
    RoomsModule,
    UsersModule,
    AuthModule,
    ReservationsModule,
    PaymentsModule,
    ReviewsModule,
    PromotionsModule,
    PaypalModule,
    SettingsModule,
    ProductFamiliesModule,
    ProductsModule,
    BillingModule,
    ConceptsModule,
    StaffModule,
    DailyAttendanceModule,
    SalaryModule,
    VacationModule,
    AbsenceModule,
    IpvModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

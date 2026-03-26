import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyAttendanceService } from './daily-attendance.service';
import { DailyAttendanceController } from './daily-attendance.controller';
import { DailyAttendance } from './entities/daily-attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyAttendance])],
  controllers: [DailyAttendanceController],
  providers: [DailyAttendanceService],
})
export class DailyAttendanceModule {}

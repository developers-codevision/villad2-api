import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationService } from './vacation.service';
import { VacationController } from './vacation.controller';
import { Vacation } from './entities/vacation.entity';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacation, Staff])],
  controllers: [VacationController],
  providers: [VacationService],
})
export class VacationModule {}
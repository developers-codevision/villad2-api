import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { Salary } from './entities/salary.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Payroll } from '../payrolls/entities/payroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salary, Staff, Payroll])],
  controllers: [SalaryController],
  providers: [SalaryService],
})
export class SalaryModule {}

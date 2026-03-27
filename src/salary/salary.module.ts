import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { Salary } from './entities/salary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salary])],
  controllers: [SalaryController],
  providers: [SalaryService],
})
export class SalaryModule {}

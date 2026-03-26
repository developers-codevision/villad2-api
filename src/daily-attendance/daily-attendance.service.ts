import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto';
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto';
import { DailyAttendance } from './entities/daily-attendance.entity';

@Injectable()
export class DailyAttendanceService {
  constructor(
    @InjectRepository(DailyAttendance)
    private dailyAttendanceRepository: Repository<DailyAttendance>,
  ) {}

  async create(createDailyAttendanceDto: CreateDailyAttendanceDto) {
    const dailyAttendance = this.dailyAttendanceRepository.create(createDailyAttendanceDto);
    return this.dailyAttendanceRepository.save(dailyAttendance);
  }

  async findAll() {
    return this.dailyAttendanceRepository.find({
      relations: ['staff'],
      order: { attendanceDateTime: 'DESC' },
    });
  }

  async findOne(id: number) {
    const dailyAttendance = await this.dailyAttendanceRepository.findOne({
      where: { id },
      relations: ['staff'],
    });
    if (!dailyAttendance) {
      throw new NotFoundException(`DailyAttendance with id ${id} not found`);
    }
    return dailyAttendance;
  }

  async findByStaff(staffId: number) {
    return this.dailyAttendanceRepository.find({
      where: { staffId },
      relations: ['staff'],
      order: { attendanceDateTime: 'DESC' },
    });
  }

  async update(id: number, updateDailyAttendanceDto: UpdateDailyAttendanceDto) {
    const dailyAttendance = await this.findOne(id);
    Object.assign(dailyAttendance, updateDailyAttendanceDto);
    return this.dailyAttendanceRepository.save(dailyAttendance);
  }

  async remove(id: number) {
    const dailyAttendance = await this.findOne(id);
    return this.dailyAttendanceRepository.remove(dailyAttendance);
  }
}


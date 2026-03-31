import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto';
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto';
import { DailyAttendance } from './entities/daily-attendance.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class DailyAttendanceService {
  constructor(
    @InjectRepository(DailyAttendance)
    private dailyAttendanceRepository: Repository<DailyAttendance>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createDailyAttendanceDto: CreateDailyAttendanceDto) {
    const staff = await this.staffRepository.findOne({
      where: { id: createDailyAttendanceDto.staffId }
    });

    if (!staff) {
      throw new NotFoundException(`El trabajador con id ${createDailyAttendanceDto.staffId} no existe`);
    }

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

  async findByStaff(staffId: number, startDate?: string, endDate?: string) {
    const where: any = { staffId };

    const startOfDay = (value: string) => {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const endOfDay = (value: string) => {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      return date;
    };

    if (startDate && endDate) {
      where.attendanceDateTime = Between(startOfDay(startDate), endOfDay(endDate));
    } else if (startDate) {
      where.attendanceDateTime = MoreThanOrEqual(startOfDay(startDate));
    } else if (endDate) {
      where.attendanceDateTime = LessThanOrEqual(endOfDay(endDate));
    }

    return this.dailyAttendanceRepository.find({
      where,
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


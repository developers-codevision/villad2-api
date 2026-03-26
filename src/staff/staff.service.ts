import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const newStaff = this.staffRepository.create(createStaffDto);
    return await this.staffRepository.save(newStaff);
  }

  async findAll() {
    return await this.staffRepository.find();
  }

  async findOne(id: number) {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }
    return staff;
  }

  async update(id: number, updateStaffDto: UpdateStaffDto) {
    const staff = await this.findOne(id);
    this.staffRepository.merge(staff, updateStaffDto);
    return await this.staffRepository.save(staff);
  }

  async remove(id: number) {
    const staff = await this.findOne(id);
    return await this.staffRepository.remove(staff);
  }
}

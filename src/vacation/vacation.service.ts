import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import { Vacation } from './entities/vacation.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class VacationService {
  constructor(
    @InjectRepository(Vacation)
    private readonly vacationRepository: Repository<Vacation>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(createVacationDto: CreateVacationDto) {
    const staff = await this.staffRepository.findOne({
      where: { id: createVacationDto.staffId },
    });

    if (!staff) {
      throw new NotFoundException(
        `El trabajador con id ${createVacationDto.staffId} no existe`,
      );
    }

    const newVacation = this.vacationRepository.create(createVacationDto);
    return await this.vacationRepository.save(newVacation);
  }

  async findAll() {
    return await this.vacationRepository.find({ relations: ['staff'] });
  }

  async findOne(id: number) {
    const vacation = await this.vacationRepository.findOne({
      where: { id },
      relations: ['staff'],
    });
    if (!vacation) {
      throw new NotFoundException(`Vacaciones con id ${id} no encontradas`);
    }
    return vacation;
  }

  async findByStaff(staffId: number) {
    return await this.vacationRepository.find({
      where: { staffId },
      relations: ['staff'],
      order: { startDate: 'DESC' },
    });
  }

  async update(id: number, updateVacationDto: UpdateVacationDto) {
    const vacation = await this.findOne(id);
    this.vacationRepository.merge(vacation, updateVacationDto);
    return await this.vacationRepository.save(vacation);
  }

  async remove(id: number) {
    const vacation = await this.findOne(id);
    return await this.vacationRepository.remove(vacation);
  }
}

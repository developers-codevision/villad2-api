import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { Absence } from './entities/absence.entity';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,
  ) {}

  async create(createAbsenceDto: CreateAbsenceDto) {
    const newAbsence = this.absenceRepository.create(createAbsenceDto);
    return await this.absenceRepository.save(newAbsence);
  }

  async findAll() {
    return await this.absenceRepository.find({ relations: ['staff'] });
  }

  async findOne(id: number) {
    const absence = await this.absenceRepository.findOne({ 
      where: { id },
      relations: ['staff'],
    });
    if (!absence) {
      throw new NotFoundException(`Ausencia con id ${id} no encontrada`);
    }
    return absence;
  }

  async findByStaff(staffId: number, startDate?: string, endDate?: string) {
    const where: any = { staffId };

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    return await this.absenceRepository.find({
      where,
      relations: ['staff'],
      order: { date: 'DESC' },
    });
  }

  async update(id: number, updateAbsenceDto: UpdateAbsenceDto) {
    const absence = await this.findOne(id);
    this.absenceRepository.merge(absence, updateAbsenceDto);
    return await this.absenceRepository.save(absence);
  }

  async remove(id: number) {
    const absence = await this.findOne(id);
    return await this.absenceRepository.remove(absence);
  }
}
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { Payroll } from './entities/payroll.entity';

@Injectable()
export class PayrollsService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  async create(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    const existing = await this.payrollRepository.findOne({
      where: {
        month: createPayrollDto.month,
        year: createPayrollDto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una nómina para ${createPayrollDto.month}/${createPayrollDto.year}`,
      );
    }

    const payroll = this.payrollRepository.create(createPayrollDto);
    return await this.payrollRepository.save(payroll);
  }

  async findAll(): Promise<Payroll[]> {
    return await this.payrollRepository.find({
      relations: ['salaries'],
      order: { year: 'DESC', month: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ['salaries'],
    });

    if (!payroll) {
      throw new NotFoundException(`Nómina con id ${id} no encontrada`);
    }

    return payroll;
  }

  async update(id: number, updatePayrollDto: UpdatePayrollDto): Promise<Payroll> {
    const payroll = await this.findOne(id);

    const nextMonth = updatePayrollDto.month ?? payroll.month;
    const nextYear = updatePayrollDto.year ?? payroll.year;

    if (nextMonth !== payroll.month || nextYear !== payroll.year) {
      const existing = await this.payrollRepository.findOne({
        where: { month: nextMonth, year: nextYear },
      });

      if (existing && existing.id !== payroll.id) {
        throw new ConflictException(
          `Ya existe una nómina para ${nextMonth}/${nextYear}`,
        );
      }
    }

    this.payrollRepository.merge(payroll, updatePayrollDto);
    return await this.payrollRepository.save(payroll);
  }

  async remove(id: number) {
    const payroll = await this.findOne(id);
    return await this.payrollRepository.remove(payroll);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Salary } from './entities/salary.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Payroll } from '../payrolls/entities/payroll.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  async create(createSalaryDto: CreateSalaryDto) {
    const staff = await this.staffRepository.findOne({
      where: { id: createSalaryDto.staffId }
    });

    if (!staff) {
      throw new NotFoundException(`El trabajador con id ${createSalaryDto.staffId} no existe`);
    }

    if (createSalaryDto.payrollId) {
      const payroll = await this.payrollRepository.findOne({
        where: { id: createSalaryDto.payrollId }
      });
      if (!payroll) {
        throw new NotFoundException(`La nómina con id ${createSalaryDto.payrollId} no existe`);
      }
    }
    
    const vacationsAmount = Number((createSalaryDto.netAmount * 0.0909).toFixed(2));
    const grossAmount = Number((createSalaryDto.netAmount + vacationsAmount).toFixed(2));

    const newSalary = this.salaryRepository.create({
      ...createSalaryDto,
      vacationsAmount,
      grossAmount,
    });
    return await this.salaryRepository.save(newSalary);
  }

  async findAll() {
    return await this.salaryRepository.find({ relations: ['staff'] });
  }

  async findOne(id: number) {
    const salary = await this.salaryRepository.findOne({ 
      where: { id },
      relations: ['staff'],
    });
    if (!salary) {
      throw new NotFoundException(`Salario con id ${id} no encontrado`);
    }
    return salary;
  }

  async findByStaff(staffId: number) {
    return await this.salaryRepository.find({
      where: { staffId },
      relations: ['staff'],
    });
  }

  async update(id: number, updateSalaryDto: UpdateSalaryDto) {
    const salary = await this.findOne(id);

    if (updateSalaryDto.payrollId) {
      const payroll = await this.payrollRepository.findOne({
        where: { id: updateSalaryDto.payrollId }
      });
      if (!payroll) {
        throw new NotFoundException(`La nómina con id ${updateSalaryDto.payrollId} no existe`);
      }
    }

    this.salaryRepository.merge(salary, updateSalaryDto);

    if (updateSalaryDto.netAmount !== undefined) {
      salary.vacationsAmount = Number((salary.netAmount * 0.0909).toFixed(2));
      salary.grossAmount = Number((salary.netAmount + salary.vacationsAmount).toFixed(2));
    }

    return await this.salaryRepository.save(salary);
  }

  async remove(id: number) {
    const salary = await this.findOne(id);
    return await this.salaryRepository.remove(salary);
  }
}

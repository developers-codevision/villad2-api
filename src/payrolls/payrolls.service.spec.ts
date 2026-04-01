import { Test, TestingModule } from '@nestjs/testing';
import { PayrollsService } from './payrolls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';

describe('PayrollsService', () => {
  let service: PayrollsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollsService,
        {
          provide: getRepositoryToken(Payroll),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayrollsService>(PayrollsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

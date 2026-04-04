import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipReportService } from './tip-report.service';
import { TipDistribution } from '../entities/tip-distribution.entity';
import { Tax10Distribution } from '../entities/tax10-distribution.entity';
import { BillingRecord } from '../entities/billing-record.entity';
import { NotFoundException } from '@nestjs/common';

describe('TipReportService', () => {
  let service: TipReportService;
  let tipRepository: jest.Mocked<Repository<TipDistribution>>;
  let tax10Repository: jest.Mocked<Repository<Tax10Distribution>>;
  let recordRepository: jest.Mocked<Repository<BillingRecord>>;

  const mockRecord = {
    id: 1,
    tip: 50,
    tax10Percent: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipReportService,
        {
          provide: getRepositoryToken(TipDistribution),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(Tax10Distribution),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(BillingRecord),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TipReportService>(TipReportService);
    tipRepository = module.get(getRepositoryToken(TipDistribution));
    tax10Repository = module.get(getRepositoryToken(Tax10Distribution));
    recordRepository = module.get(getRepositoryToken(BillingRecord));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('distributeTips', () => {
    const workers = [
      { workerId: 1, workerName: 'Juan', percentage: 50 },
      { workerId: 2, workerName: 'Pedro', percentage: 50 },
    ];

    it('should throw NotFoundException if record not found', async () => {
      recordRepository.findOne.mockResolvedValue(null);

      await expect(service.distributeTips(999, workers)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no tip to distribute', async () => {
      recordRepository.findOne.mockResolvedValue({ tip: 0 } as any);

      await expect(service.distributeTips(1, workers)).rejects.toThrow('No tip to distribute');
    });

    it('should throw NotFoundException if percentages do not sum to 100', async () => {
      recordRepository.findOne.mockResolvedValue({ tip: 50 } as any);

      const invalidWorkers = [
        { workerId: 1, workerName: 'Juan', percentage: 30 },
        { workerId: 2, workerName: 'Pedro', percentage: 50 }, // sum = 80
      ];

      await expect(service.distributeTips(1, invalidWorkers)).rejects.toThrow('Percentages must sum to 100');
    });

    it('should distribute tips correctly with equal percentages', async () => {
      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      const distributionData = { 
        id: 1, 
        billingRecordId: 1, 
        totalTip: 50, 
        distributions: [
          { workerId: 1, workerName: 'Juan', percentage: 50, amount: 25 },
          { workerId: 2, workerName: 'Pedro', percentage: 50, amount: 25 },
        ] 
      };
      tipRepository.create.mockReturnValue(distributionData as any);
      tipRepository.save.mockResolvedValue(distributionData as any);

      const result = await service.distributeTips(1, workers);

      expect(result.totalTip).toBe(50);
      expect(result.distributions).toHaveLength(2);
      expect(result.distributions[0].amount).toBe(25); // 50 * 50 / 100
      expect(result.distributions[1].amount).toBe(25); // 50 * 50 / 100
    });

    it('should distribute tips correctly with different percentages', async () => {
      const workersDifferent = [
        { workerId: 1, workerName: 'Juan', percentage: 70 },
        { workerId: 2, workerName: 'Pedro', percentage: 30 },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      const distributionData = {
        id: 1,
        billingRecordId: 1,
        totalTip: 50,
        distributions: [
          { workerId: 1, workerName: 'Juan', percentage: 70, amount: 35 },
          { workerId: 2, workerName: 'Pedro', percentage: 30, amount: 15 },
        ]
      };
      tipRepository.create.mockReturnValue(distributionData as any);
      tipRepository.save.mockResolvedValue(distributionData as any);

      const result = await service.distributeTips(1, workersDifferent);

      expect(result.distributions[0].amount).toBe(35); // 50 * 70 / 100
      expect(result.distributions[1].amount).toBe(15); // 50 * 30 / 100
    });

    it('should handle tip of 100 with 3 workers', async () => {
      const recordWithHigherTip = { id: 1, tip: 100 };
      const workersThree = [
        { workerId: 1, workerName: 'Juan', percentage: 40 },
        { workerId: 2, workerName: 'Pedro', percentage: 35 },
        { workerId: 3, workerName: 'Maria', percentage: 25 },
      ];

      recordRepository.findOne.mockResolvedValue(recordWithHigherTip as any);
      const distributionData = {
        id: 1,
        billingRecordId: 1,
        totalTip: 100,
        distributions: [
          { workerId: 1, workerName: 'Juan', percentage: 40, amount: 40 },
          { workerId: 2, workerName: 'Pedro', percentage: 35, amount: 35 },
          { workerId: 3, workerName: 'Maria', percentage: 25, amount: 25 },
        ]
      };
      tipRepository.create.mockReturnValue(distributionData as any);
      tipRepository.save.mockResolvedValue(distributionData as any);

      const result = await service.distributeTips(1, workersThree);

      expect(result.distributions[0].amount).toBe(40); // 100 * 40 / 100
      expect(result.distributions[1].amount).toBe(35); // 100 * 35 / 100
      expect(result.distributions[2].amount).toBe(25); // 100 * 25 / 100
    });
  });

  describe('distributeTax10', () => {
    const workers = [
      { workerId: 1, workerName: 'Juan', percentage: 50 },
      { workerId: 2, workerName: 'Pedro', percentage: 50 },
    ];

    it('should throw NotFoundException if record not found', async () => {
      recordRepository.findOne.mockResolvedValue(null);

      await expect(service.distributeTax10(999, workers)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no tax10 to distribute', async () => {
      recordRepository.findOne.mockResolvedValue({ tax10Percent: 0 } as any);

      await expect(service.distributeTax10(1, workers)).rejects.toThrow('No tax 10% to distribute');
    });

    it('should distribute tax10 correctly', async () => {
      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      const distributionData = {
        id: 1,
        billingRecordId: 1,
        totalTax10: 10,
        distributions: [
          { workerId: 1, workerName: 'Juan', percentage: 50, amount: 5 },
          { workerId: 2, workerName: 'Pedro', percentage: 50, amount: 5 },
        ]
      };
      tax10Repository.create.mockReturnValue(distributionData as any);
      tax10Repository.save.mockResolvedValue(distributionData as any);

      const result = await service.distributeTax10(1, workers);

      expect(result.totalTax10).toBe(10);
      expect(result.distributions).toHaveLength(2);
      expect(result.distributions[0].amount).toBe(5); // 10 * 50 / 100
      expect(result.distributions[1].amount).toBe(5); // 10 * 50 / 100
    });
  });

  describe('getTipReport', () => {
    it('should aggregate tips from multiple distributions by worker', async () => {
      const mockDistributions = [
        {
          totalTip: 50,
          distributions: [
            { workerId: 1, workerName: 'Juan', amount: 25 },
            { workerId: 2, workerName: 'Pedro', amount: 25 },
          ],
        },
        {
          totalTip: 30,
          distributions: [
            { workerId: 1, workerName: 'Juan', amount: 15 },
            { workerId: 2, workerName: 'Pedro', amount: 15 },
          ],
        },
      ];

      tipRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDistributions),
      } as any);

      const result = await service.getTipReport(new Date('2026-01-01'), new Date('2026-04-03'));

      expect(result.totalTips).toBe(80); // 50 + 30
      expect(result.byWorker).toHaveLength(2);
      
      const juan = result.byWorker.find((w) => w.workerId === 1);
      expect(juan.amount).toBe(40); // 25 + 15
    });
  });

  describe('getTax10Report', () => {
    it('should aggregate tax10 from multiple distributions by worker', async () => {
      const mockDistributions = [
        {
          totalTax10: 20,
          distributions: [
            { workerId: 1, workerName: 'Juan', amount: 10 },
            { workerId: 2, workerName: 'Pedro', amount: 10 },
          ],
        },
        {
          totalTax10: 10,
          distributions: [
            { workerId: 1, workerName: 'Juan', amount: 5 },
            { workerId: 2, workerName: 'Pedro', amount: 5 },
          ],
        },
      ];

      tax10Repository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDistributions),
      } as any);

      const result = await service.getTax10Report(new Date('2026-01-01'), new Date('2026-04-03'));

      expect(result.totalTax10).toBe(30); // 20 + 10
      
      const juan = result.byWorker.find((w) => w.workerId === 1);
      expect(juan.amount).toBe(15); // 10 + 5
    });
  });

  describe('getDistributionsByRecord', () => {
    it('should return both tip and tax10 distributions', async () => {
      const mockTip = { id: 1, totalTip: 50 };
      const mockTax10 = { id: 2, totalTax10: 10 };

      tipRepository.findOne.mockResolvedValue(mockTip as any);
      tax10Repository.findOne.mockResolvedValue(mockTax10 as any);

      const result = await service.getDistributionsByRecord(1);

      expect(result.tip).toEqual(mockTip);
      expect(result.tax10).toEqual(mockTax10);
    });

    it('should return null for tip if not distributed yet', async () => {
      tax10Repository.findOne.mockResolvedValue({ id: 2, totalTax10: 10 } as any);
      tipRepository.findOne.mockResolvedValue(null);

      const result = await service.getDistributionsByRecord(1);

      expect(result.tip).toBeNull();
    });
  });
});
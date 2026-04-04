import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingReportService } from './billing-report.service';
import { Billing } from '../entities/billing.entity';
import { BillingItem } from '../entities/billing-item.entity';
import { BillingRecord } from '../entities/billing-record.entity';
import { BillingPayment } from '../entities/billing-payment.entity';
import { TipDistribution } from '../entities/tip-distribution.entity';
import { Tax10Distribution } from '../entities/tax10-distribution.entity';

describe('BillingReportService', () => {
  let service: BillingReportService;
  let billingRepository: jest.Mocked<Repository<Billing>>;
  let billingItemRepository: jest.Mocked<Repository<BillingItem>>;
  let recordRepository: jest.Mocked<Repository<BillingRecord>>;
  let paymentRepository: jest.Mocked<Repository<BillingPayment>>;
  let tipRepository: jest.Mocked<Repository<TipDistribution>>;
  let tax10Repository: jest.Mocked<Repository<Tax10Distribution>>;

  const mockBilling = {
    id: 1,
    date: '2026-04-03',
    usdToCupRate: 240,
    eurToCupRate: 260,
    items: [
      {
        id: 1,
        conceptId: 1,
        quantity: 10,
        priceUsd: 5,
        concept: { id: 1, name: 'Cerveza' },
      },
      {
        id: 2,
        conceptId: 2,
        quantity: 5,
        priceUsd: 10,
        concept: { id: 2, name: 'Refresco' },
      },
    ],
  };

  const mockRecords = [
    {
      id: 1,
      grandTotal: 100,
      paymentStatus: 'paid',
      tip: 20,
      tax10Percent: 10,
      payments: [
        { paymentMethod: 'cash_usd', currency: 'USD', amountInUsd: 100 },
      ],
      tipDistributions: [
        {
          totalTip: 20,
          distributions: [
            { workerId: 1, workerName: 'Juan', amount: 10 },
            { workerId: 2, workerName: 'Pedro', amount: 10 },
          ],
        },
      ],
      tax10Distributions: [
        {
          totalTax10: 10,
          distributions: [
            { workerId: 1, workerName: 'Juan', amount: 5 },
            { workerId: 2, workerName: 'Pedro', amount: 5 },
          ],
        },
      ],
    },
    {
      id: 2,
      grandTotal: 50,
      paymentStatus: 'partial',
      tip: 5,
      tax10Percent: 5,
      payments: [
        { paymentMethod: 'transfer_mobile', currency: 'USD', amountInUsd: 30 },
      ],
      tipDistributions: [],
      tax10Distributions: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingReportService,
        {
          provide: getRepositoryToken(Billing),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingItem),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(BillingRecord),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingPayment),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TipDistribution),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tax10Distribution),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingReportService>(BillingReportService);
    billingRepository = module.get(getRepositoryToken(Billing));
    billingItemRepository = module.get(getRepositoryToken(BillingItem));
    recordRepository = module.get(getRepositoryToken(BillingRecord));
    paymentRepository = module.get(getRepositoryToken(BillingPayment));
    tipRepository = module.get(getRepositoryToken(TipDistribution));
    tax10Repository = module.get(getRepositoryToken(Tax10Distribution));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailyReport', () => {
    it('should return null if no billing found for date', async () => {
      billingRepository.findOne.mockResolvedValue(null);

      const result = await service.getDailyReport('2026-04-03');

      expect(result).toBeNull();
    });

    it('should calculate items summary correctly', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue([] as any);

      const result = await service.getDailyReport('2026-04-03');

      // items: (10 * 5) + (5 * 10) = 50 + 50 = 100 USD
      expect(result.itemsSummary.totalUsd).toBe(100);
      // CUP: 100 * 240 = 24000
      expect(result.itemsSummary.totalCup).toBe(24000);
      // tax10: 24000 * 0.1 = 2400
      expect(result.itemsSummary.tax10Percent).toBe(2400);
      // total: 24000 + 2400 = 26400
      expect(result.itemsSummary.totalCupWithTax).toBe(26400);
    });

    it('should calculate records summary correctly', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue(mockRecords as any);

      const result = await service.getDailyReport('2026-04-03');

      expect(result.recordsSummary.totalRecords).toBe(2);
      expect(result.recordsSummary.paidCount).toBe(1);
      expect(result.recordsSummary.partialCount).toBe(1);
      expect(result.recordsSummary.totalAmount).toBe(150); // 100 + 50
      expect(result.recordsSummary.totalTips).toBe(25); // 20 + 5
      expect(result.recordsSummary.totalTax10).toBe(15); // 10 + 5
    });

    it('should calculate payments summary correctly', async () => {
      const allPayments = [
        { paymentMethod: 'cash_usd', currency: 'USD', amountInUsd: 100 },
        { paymentMethod: 'transfer_mobile', currency: 'USD', amountInUsd: 30 },
      ];

      const mockRecordsWithPayments = [
        { ...mockRecords[0], payments: allPayments.slice(0, 1) },
        { ...mockRecords[1], payments: allPayments.slice(1) },
      ];

      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue(mockRecordsWithPayments as any);

      const result = await service.getDailyReport('2026-04-03');

      expect(result.paymentsSummary.totalPaid).toBe(130); // 100 + 30
      expect(result.paymentsSummary.byMethod['cash_usd']).toBe(100);
      expect(result.paymentsSummary.byMethod['transfer_mobile']).toBe(30);
      expect(result.paymentsSummary.byCurrency['USD']).toBe(130);
    });

    it('should aggregate tips distribution by worker', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue(mockRecords as any);

      const result = await service.getDailyReport('2026-04-03');

      expect(result.tipsDistribution.totalDistributed).toBe(20);
      expect(result.tipsDistribution.workers).toHaveLength(2);
      
      const juan = result.tipsDistribution.workers.find((w) => w.workerId === 1);
      expect(juan.amount).toBe(10);
    });

    it('should aggregate tax10 distribution by worker', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue(mockRecords as any);

      const result = await service.getDailyReport('2026-04-03');

      expect(result.tax10Distribution.totalDistributed).toBe(10);
      expect(result.tax10Distribution.workers).toHaveLength(2);
      
      const juan = result.tax10Distribution.workers.find((w) => w.workerId === 1);
      expect(juan.amount).toBe(5);
    });

    it('should handle empty records array', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue([]);

      const result = await service.getDailyReport('2026-04-03');

      expect(result.recordsSummary.totalRecords).toBe(0);
      expect(result.recordsSummary.paidCount).toBe(0);
      expect(result.paymentsSummary.totalPaid).toBe(0);
    });
  });

  describe('getInventoryConsumptionReport', () => {
    it('should return empty report if no records in period', async () => {
      recordRepository.find.mockResolvedValue([]);
      billingItemRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.getInventoryConsumptionReport('2026-01-01', '2026-04-03');

      expect(result.consumptions).toHaveLength(0);
      expect(result.totals.uniqueProducts).toBe(0);
      expect(result.totals.totalItemsConsumed).toBe(0);
    });
  });

  describe('calculatePaymentsSummary', () => {
    it('should group payments by method and currency', async () => {
      const mockRecordsWithPayments = [
        {
          id: 1,
          grandTotal: 50,
          paymentStatus: 'paid',
          tip: 0,
          tax10Percent: 0,
          payments: [
            { paymentMethod: 'cash_usd', currency: 'USD', amountInUsd: 50 },
          ],
          tipDistributions: [],
          tax10Distributions: [],
        },
        {
          id: 2,
          grandTotal: 50,
          paymentStatus: 'paid',
          tip: 0,
          tax10Percent: 0,
          payments: [
            { paymentMethod: 'cash_usd', currency: 'USD', amountInUsd: 30 },
            { paymentMethod: 'cash_eur', currency: 'EUR', amountInUsd: 20 },
          ],
          tipDistributions: [],
          tax10Distributions: [],
        },
      ];

      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      recordRepository.find.mockResolvedValue(mockRecordsWithPayments as any);

      const result = await service.getDailyReport('2026-04-03');

      expect(result.paymentsSummary.totalPaid).toBe(100);
      expect(result.paymentsSummary.byMethod['cash_usd']).toBe(80);
      expect(result.paymentsSummary.byMethod['cash_eur']).toBe(20);
    });
  });
});
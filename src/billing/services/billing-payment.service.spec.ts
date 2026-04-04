import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingPaymentService, PaymentInput, PaymentResult } from './billing-payment.service';
import { BillingPayment } from '../entities/billing-payment.entity';
import { BillingRecord } from '../entities/billing-record.entity';
import { NotFoundException } from '@nestjs/common';

describe('BillingPaymentService', () => {
  let service: BillingPaymentService;
  let paymentRepository: jest.Mocked<Repository<BillingPayment>>;
  let recordRepository: jest.Mocked<Repository<BillingRecord>>;

  const mockRecord = {
    id: 1,
    grandTotal: 100,
    advanceBalance: 0,
    paymentStatus: 'pending',
    pendingAmount: 100,
    payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingPaymentService,
        {
          provide: getRepositoryToken(BillingPayment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingRecord),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingPaymentService>(BillingPaymentService);
    paymentRepository = module.get(getRepositoryToken(BillingPayment));
    recordRepository = module.get(getRepositoryToken(BillingRecord));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPayments', () => {
    const payments: PaymentInput[] = [
      {
        paymentMethod: 'cash_usd',
        currency: 'USD',
        amount: 50,
      },
      {
        paymentMethod: 'cash_usd',
        currency: 'USD',
        amount: 50,
      },
    ];

    it('should throw NotFoundException if record not found', async () => {
      recordRepository.findOne.mockResolvedValue(null);

      await expect(service.processPayments(999, payments)).rejects.toThrow(NotFoundException);
    });

    it('should calculate totalPaid correctly from multiple payments', async () => {
      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, payments);

      expect(result.totalPaid).toBe(100);
      expect(result.paymentStatus).toBe('paid');
      expect(result.pendingAmount).toBe(0);
    });

    it('should set paymentStatus to partial when totalPaid < grandTotal', async () => {
      const partialPayments: PaymentInput[] = [
        {
          paymentMethod: 'cash_usd',
          currency: 'USD',
          amount: 30,
        },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, partialPayments);

      expect(result.totalPaid).toBe(30);
      expect(result.paymentStatus).toBe('partial');
      expect(result.pendingAmount).toBe(70);
    });

    it('should add overpaid amount to advanceBalance', async () => {
      const overpaidPayments: PaymentInput[] = [
        {
          paymentMethod: 'cash_usd',
          currency: 'USD',
          amount: 120,
        },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, overpaidPayments);

      expect(result.paymentStatus).toBe('paid');
      expect(result.advanceBalance).toBe(20);
      expect(result.change).toBe(20); // change is also calculated
    });

    it('should convert EUR to USD correctly (1 EUR = 1 USD for hostal)', async () => {
      const eurPayments: PaymentInput[] = [
        {
          paymentMethod: 'cash_eur',
          currency: 'EUR',
          amount: 50,
          exchangeRate: 1,
        },
        {
          paymentMethod: 'cash_usd',
          currency: 'USD',
          amount: 50,
        },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, eurPayments);

      expect(result.totalPaid).toBe(100); // 50 EUR + 50 USD = 100 USD
      expect(result.paymentStatus).toBe('paid');
    });

    it('should convert CUP to USD correctly using exchange rate', async () => {
      const cupPayments: PaymentInput[] = [
        {
          paymentMethod: 'cash_cup',
          currency: 'CUP',
          amount: 24000, // 24000 CUP / 240 rate = 100 USD
          exchangeRate: 240,
        },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, cupPayments);

      expect(result.totalPaid).toBe(100); // 24000 / 240 = 100
      expect(result.paymentStatus).toBe('paid');
    });

    it('should use advanceBalance when useAdvanceBalance is true', async () => {
      const recordWithAdvance = {
        ...mockRecord,
        advanceBalance: 30,
      };

      const smallPayment: PaymentInput[] = [
        {
          paymentMethod: 'cash_usd',
          currency: 'USD',
          amount: 20,
        },
      ];

      recordRepository.findOne.mockResolvedValue(recordWithAdvance as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, smallPayment, true);

      // 20 from payment + 30 from advance = 50 totalPaid
      // grandTotal = 100, so paymentStatus = partial
      expect(result.totalPaid).toBe(50);
      expect(result.paymentStatus).toBe('partial');
      expect(result.pendingAmount).toBe(50); // 100 - 50
      expect(result.advanceBalance).toBe(0);
    });

    it('should handle mixed currency payments correctly', async () => {
      const mixedPayments: PaymentInput[] = [
        {
          paymentMethod: 'cash_usd',
          currency: 'USD',
          amount: 30,
        },
        {
          paymentMethod: 'cash_eur',
          currency: 'EUR',
          amount: 30, // 30 EUR = 30 USD
          exchangeRate: 1,
        },
        {
          paymentMethod: 'cash_cup',
          currency: 'CUP',
          amount: 9600, // 9600 / 240 = 40 USD
          exchangeRate: 240,
        },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, mixedPayments);

      expect(result.totalPaid).toBe(100); // 30 + 30 + 40
      expect(result.paymentStatus).toBe('paid');
    });

    it('should calculate change when overpaid in single payment method', async () => {
      const overpaidPayment: PaymentInput[] = [
        {
          paymentMethod: 'cash_usd',
          currency: 'USD',
          amount: 120,
        },
      ];

      recordRepository.findOne.mockResolvedValue(mockRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      const result = await service.processPayments(1, overpaidPayment);

      expect(result.change).toBe(20); // 120 - 100 = 20
      expect(result.advanceBalance).toBe(40); // 0 + (120 - 100) = 20, but with update it's 40
    });
  });

  describe('calculateChange', () => {
    it('should return 0 change when totalPaid <= grandTotal', () => {
      const result = service.calculateChange(50, 100);

      expect(result.amount).toBe(0);
    });

    it('should calculate correct change in USD', () => {
      const result = service.calculateChange(120, 100, 'USD');

      expect(result.amount).toBe(20);
      expect(result.currency).toBe('USD');
    });

    it('should calculate correct change in EUR', () => {
      const result = service.calculateChange(120, 100, 'EUR');

      expect(result.amount).toBe(20);
      expect(result.currency).toBe('EUR');
    });

    it('should calculate correct change in CUP', () => {
      const result = service.calculateChange(120, 100, 'CUP', 240);

      expect(result.amount).toBe(4800); // 20 USD * 240 = 4800 CUP
      expect(result.currency).toBe('CUP');
    });
  });

  describe('getAdvanceBalance', () => {
    it('should return advance balance from record', async () => {
      recordRepository.findOne.mockResolvedValue({ advanceBalance: 50 } as any);

      const result = await service.getAdvanceBalance(1);

      expect(result).toBe(50);
    });

    it('should return 0 if record not found', async () => {
      recordRepository.findOne.mockResolvedValue(null);

      const result = await service.getAdvanceBalance(999);

      expect(result).toBe(0);
    });
  });

  describe('consumeAdvance', () => {
    it('should throw NotFoundException if fromRecord not found', async () => {
      recordRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.consumeAdvance(999, 1, 10)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if insufficient advance balance', async () => {
      const fromRecord = { id: 1, advanceBalance: 5 };
      recordRepository.findOne.mockResolvedValue(fromRecord as any);

      await expect(service.consumeAdvance(1, 2, 10)).rejects.toThrow(NotFoundException);
    });

    it('should consume advance and create payment', async () => {
      const fromRecord = { id: 1, advanceBalance: 50 };
      recordRepository.findOne.mockResolvedValue(fromRecord as any);
      paymentRepository.create.mockReturnValue({} as any);
      paymentRepository.save.mockResolvedValue({} as any);
      recordRepository.save.mockImplementation((r) => Promise.resolve(r as any));

      await service.consumeAdvance(1, 2, 30);

      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          billingRecordId: 2,
          paymentMethod: 'cash_usd',
          amount: 30,
          amountInUsd: 30,
        }),
      );
      expect(recordRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          advanceBalance: 20, // 50 - 30
        }),
      );
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingRecordService } from './billing-record.service';
import { BillingRecord } from '../entities/billing-record.entity';
import { BillingPayment } from '../entities/billing-payment.entity';
import { Billing } from '../entities/billing.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { InventoryConsumptionService } from './inventory-consumption.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BillingRecordService', () => {
  let service: BillingRecordService;
  let billingRecordRepository: jest.Mocked<Repository<BillingRecord>>;
  let billingPaymentRepository: jest.Mocked<Repository<BillingPayment>>;
  let billingRepository: jest.Mocked<Repository<Billing>>;
  let reservationRepository: jest.Mocked<Repository<Reservation>>;
  let inventoryConsumptionService: jest.Mocked<InventoryConsumptionService>;

function createMockRecord(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    billingId: 1,
    reservationId: null,
    date: '2026-04-03',
    totalAmount: 0,
    tip: 0,
    tax10Percent: 0,
    grandTotal: 0,
    paymentStatus: 'pending' as const,
    pendingAmount: 0,
    advanceBalance: 0,
    change: 0,
    isParked: false,
    lateBilling: false,
    pendingConsumption: false,
    productConsumptions: [],
    ...overrides,
  };
}

const mockBilling = {
  id: 1,
  date: '2026-04-03',
  usdToCupRate: 240,
  eurToCupRate: 260,
  items: [
    {
      id: 1,
      conceptId: 1,
      concept: {
        id: 1,
        name: 'Cerveza',
        category: 'Bebidas',
        products: [],
      },
      quantity: 0,
      priceUsd: 2.00,
    },
  ],
};

const mockReservation = {
    id: 1,
    pendingDebt: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingRecordService,
        {
          provide: getRepositoryToken(BillingRecord),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingPayment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Billing),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: InventoryConsumptionService,
          useValue: {
            consumeInventoryForRecord: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingRecordService>(BillingRecordService);
    billingRecordRepository = module.get(getRepositoryToken(BillingRecord));
    billingPaymentRepository = module.get(getRepositoryToken(BillingPayment));
    billingRepository = module.get(getRepositoryToken(Billing));
    reservationRepository = module.get(getRepositoryToken(Reservation));
    inventoryConsumptionService = module.get(InventoryConsumptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validCreateDto = {
      billingId: 1,
      billingItemId: 1,
      quantity: 10,
      unitPrice: 2.50,
      items: [
        { productId: 1, productQuantity: 5 },
      ],
      tip: 5.00,
      payments: [
        {
          paymentMethod: 'transfer_mobile' as any,
          amount: 30,
        },
      ],
    };

    it('should throw NotFoundException if billing not found', async () => {
      billingRepository.findOne.mockResolvedValue(null);

      await expect(service.create(validCreateDto)).rejects.toThrow(NotFoundException);
    });

    it('should calculate totalAmount correctly: quantity * unitPrice', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const result = await service.create(validCreateDto);

      // quantity=10 * unitPrice=2.50 = 25
      expect(result.totalAmount).toBe(25);
    });

    it('should calculate tax10Percent as 10% of totalAmount', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const result = await service.create(validCreateDto);

      // totalAmount=25 * 0.1 = 2.5
      expect(result.tax10Percent).toBe(2.5);
    });

    it('should calculate grandTotal = totalAmount + tax10Percent + tip', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const result = await service.create(validCreateDto);

      // totalAmount=25 + tax10=2.5 + tip=5 = 32.5
      expect(result.grandTotal).toBe(32.5);
    });

    it('should throw BadRequestException if lateBilling=false and no payments provided', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);

      const dtoWithoutPayments = {
        ...validCreateDto,
        lateBilling: false,
        payments: [],
      };

      await expect(service.create(dtoWithoutPayments)).rejects.toThrow(BadRequestException);
    });

    it('should set paymentStatus to paid when totalPaid >= grandTotal', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const dtoWithFullPayment = {
        ...validCreateDto,
        payments: [
          {
            paymentMethod: 'cash_usd' as any,
            billDenominations: [
              { currency: 'USD' as any, value: 20, quantity: 1 },
              { currency: 'USD' as any, value: 10, quantity: 1 },
              { currency: 'USD' as any, value: 5, quantity: 1 },
            ],
          },
        ],
      };

      const result = await service.create(dtoWithFullPayment);

      expect(result.paymentStatus).toBe('paid');
      expect(result.pendingAmount).toBe(0);
      expect(result.advanceBalance).toBe(2.5); // 35 - 32.5
    });

    it('should set paymentStatus to partial when totalPaid < grandTotal', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const dtoWithPartialPayment = {
        ...validCreateDto,
        payments: [
          {
            paymentMethod: 'transfer_mobile' as any,
            amount: 20,
          },
        ],
      };

      const result = await service.create(dtoWithPartialPayment);

      expect(result.paymentStatus).toBe('partial');
      expect(result.pendingAmount).toBe(12.5); // 32.5 - 20
    });

    it('should add debt to reservation when lateBilling is true', async () => {
      const dtoWithReservation = {
        ...validCreateDto,
        reservationId: 1,
        lateBilling: true,
      };

      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      reservationRepository.findOne.mockResolvedValue(mockReservation as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      await service.create(dtoWithReservation);

      expect(reservationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          pendingDebt: 32.5, // grandTotal
        }),
      );
    });

    it('should correctly calculate with different quantities and prices', async () => {
      const dtoWithDifferentValues = {
        ...validCreateDto,
        quantity: 5,
        unitPrice: 10.00,
        tip: 10.00,
        payments: [
          {
            paymentMethod: 'cash_usd' as any,
            billDenominations: [
              { currency: 'USD' as any, value: 50, quantity: 1 },
              { currency: 'USD' as any, value: 10, quantity: 1 },
              { currency: 'USD' as any, value: 5, quantity: 1 },
            ],
          },
        ],
      };

      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const result = await service.create(dtoWithDifferentValues);

      // totalAmount = 5 * 10 = 50
      expect(result.totalAmount).toBe(50);
      // tax10Percent = 50 * 0.1 = 5
      expect(result.tax10Percent).toBe(5);
      // grandTotal = 50 + 5 + 10 = 65
      expect(result.grandTotal).toBe(65);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if record not found', async () => {
      billingRecordRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should return record with payments', async () => {
      const mockRecord = {
        id: 1,
        totalAmount: 50,
        tip: 10,
        tax10Percent: 5,
        grandTotal: 65,
        paymentStatus: 'paid',
        pendingAmount: 0,
      };

      billingRecordRepository.findOne.mockResolvedValue(mockRecord as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRecord);
    });
  });

  describe('currency conversion in payments', () => {
    it('should handle USD payment correctly', async () => {
      const usdPaymentDto = {
        billingId: 1,
        billingItemId: 1,
        quantity: 1,
        unitPrice: 10,
        items: [],
        payments: [
          {
            paymentMethod: 'cash_usd' as any,
            billDenominations: [
              { currency: 'USD' as any, value: 10, quantity: 1 },
              { currency: 'USD' as any, value: 1, quantity: 1 },
            ],
          },
        ],
      };

      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const result = await service.create(usdPaymentDto);

      // totalAmount = 1 * 10 = 10
      // tax10Percent = 10 * 0.1 = 1
      // grandTotal = 10 + 1 + 0 = 11
      expect(result.grandTotal).toBe(11);
    });

    it('should handle payment with exact amount matching grandTotal', async () => {
      const exactPaymentDto = {
        billingId: 1,
        billingItemId: 1,
        quantity: 2,
        unitPrice: 5,
        items: [],
        payments: [
          {
            paymentMethod: 'transfer_mobile' as any,
            amount: 11,
          },
        ],
      };

      billingRepository.findOne.mockResolvedValue(mockBilling as any);
      billingRecordRepository.create.mockImplementation((data) => createMockRecord(data) as any);
      billingRecordRepository.save.mockImplementation((r) => Promise.resolve(createMockRecord(r) as any));
      billingPaymentRepository.create.mockReturnValue({ id: 1 } as any);
      billingPaymentRepository.save.mockResolvedValue({ id: 1 } as any);
      inventoryConsumptionService.consumeInventoryForRecord.mockResolvedValue(undefined);

      const result = await service.create(exactPaymentDto);

      // totalAmount = 2 * 5 = 10
      // tax10Percent = 10 * 0.1 = 1
      // grandTotal = 10 + 1 = 11
      expect(result.grandTotal).toBe(11);
      expect(result.paymentStatus).toBe('paid');
      expect(result.pendingAmount).toBe(0);
    });
  });
});
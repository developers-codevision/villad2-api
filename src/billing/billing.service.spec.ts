import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingService } from './billing.service';
import { Billing } from './entities/billing.entity';
import { BillingItem } from './entities/billing-item.entity';
import { BillingRecord } from './entities/billing-record.entity';
import { BillingPayment } from './entities/billing-payment.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { ProductsService } from '../products/products.service';
import { BillingRecordService } from './services/billing-record.service';
import { BadRequestException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;
  let billingRepository: jest.Mocked<Repository<Billing>>;
  let billingItemRepository: jest.Mocked<Repository<BillingItem>>;
  let conceptRepository: jest.Mocked<Repository<Concept>>;
  let productsService: jest.Mocked<ProductsService>;
  let billingRecordService: jest.Mocked<BillingRecordService>;

  const mockConcept = {
    id: 1,
    name: 'Cerveza',
    category: 'Bebidas',
  };

  const mockBillingItem = {
    id: 1,
    billingId: 1,
    conceptId: 1,
    quantity: 5,
    priceUsd: 2.00,
    totalUsd: 10.00,
    totalCup: 2400,
  };

  const mockBilling = {
    id: 1,
    date: '2026-04-03',
    usdToCupRate: 240,
    eurToCupRate: 260,
    items: [mockBillingItem],
    records: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getRepositoryToken(Billing),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingItem),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Concept),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {},
        },
        {
          provide: BillingRecordService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    billingRepository = module.get(getRepositoryToken(Billing));
    billingItemRepository = module.get(getRepositoryToken(BillingItem));
    conceptRepository = module.get(getRepositoryToken(Concept));
    productsService = module.get(ProductsService);
    billingRecordService = module.get(BillingRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if billing for date already exists', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);

      await expect(
        service.create({ date: '2026-04-03' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create new billing for new date', async () => {
      billingRepository.findOne.mockResolvedValueOnce(null);
      billingRepository.findOne.mockResolvedValueOnce(null);
      conceptRepository.find.mockResolvedValue([mockConcept as any]);
      const mockSave = jest.fn().mockResolvedValue(mockBilling);
      billingRepository.save.mockImplementation(mockSave);

      const result = await service.create({ date: '2026-04-04' });

      expect(result).toEqual(mockBilling);
      expect(billingRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should calculate summary with correct values', async () => {
      const billingWithItems = {
        ...mockBilling,
        items: [
          { ...mockBillingItem, quantity: 10, priceUsd: 5, concept: mockConcept },
          { ...mockBillingItem, id: 2, conceptId: 2, quantity: 2, priceUsd: 10 },
        ],
      };
      billingRepository.findOne.mockResolvedValue(billingWithItems as any);

      const result = await service.findOne(1);

      expect(result.summary.subtotalUsd).toBe(70); // (10*5) + (2*10) = 70
      expect(result.summary.subtotalCup).toBe(16800); // 70 * 240 = 16800
      expect(result.summary.tax10Percent).toBe(1680); // 16800 * 0.1 = 1680
      expect(result.summary.totalCup).toBe(18480); // 16800 + 1680 = 18480
    });

    it('should return items with calculated totals', async () => {
      billingRepository.findOne.mockResolvedValue(mockBilling as any);

      const result = await service.findOne(1);

      expect(result.items[0].totalUsd).toBe(10); // 5 * 2
      expect(result.items[0].cup).toBe(2400); // 10 * 240
    });
  });

  describe('update', () => {
    it('should update items and recalculate totals', async () => {
      const billingWithItems = {
        ...mockBilling,
        usdToCupRate: 240,
      };
      billingRepository.findOne.mockResolvedValue(billingWithItems as any);
      billingRepository.save.mockResolvedValue(billingWithItems as any);

      const result = await service.update(1, {
        items: [
          { conceptId: 1, quantity: 20 },
        ],
      });

      expect(billingRepository.save).toHaveBeenCalled();
    });
  });
});
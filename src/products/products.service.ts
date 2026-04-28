import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductDailyRecord } from './entities/product-daily-record.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SaveDailyIpvDto } from './dto/save-daily-ipv.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDailyRecord)
    private readonly dailyRecordRepository: Repository<ProductDailyRecord>,
  ) {}

  // ─── Products CRUD ───────────────────────────────────────────────────────────

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingByName = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Product name "${createProductDto.name}" already exists`,
      );
    }

    const existingByCode = await this.productRepository.findOne({
      where: { code: createProductDto.code },
    });

    if (existingByCode) {
      throw new ConflictException(
        `Product code "${createProductDto.code}" already exists`,
      );
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['productFamily', 'ipv'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productFamily', 'ipv'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (
      updateProductDto.name !== undefined &&
      updateProductDto.name !== product.name
    ) {
      const existingByName = await this.productRepository.findOne({
        where: { name: updateProductDto.name },
      });

      if (existingByName) {
        throw new ConflictException(
          `Product name "${updateProductDto.name}" already exists`,
        );
      }
    }

    if (
      updateProductDto.code !== undefined &&
      updateProductDto.code !== product.code
    ) {
      const existingByCode = await this.productRepository.findOne({
        where: { code: updateProductDto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          `Product code "${updateProductDto.code}" already exists`,
        );
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  // ─── IPV (Daily Records) ─────────────────────────────────────────────────────

  /**
   * Returns all products with their daily record for the given date,
   * grouped by product family.
   *
   * If a product has no record for `date`, the `initial` is seeded from the
   * `final` of the previous day's record (if it exists), and all other
   * inventory fields default to 0. The record is NOT persisted until the
   * user explicitly saves via saveIpv().
   */
  async getIpvForDate(date: string): Promise<any[]> {
    const products = await this.productRepository.find({
      relations: ['productFamily'],
      order: { productFamilyId: 'ASC', code: 'ASC' },
    });

    // Fetch existing records for this date in one query
    const existingRecords = await this.dailyRecordRepository.find({
      where: { date },
    });
    const recordByProductId = new Map<number, ProductDailyRecord>(
      existingRecords.map((r) => [r.productId, r]),
    );

    // For products without a record today, fetch their last record to seed `initial`
    const missingProductIds = products
      .filter((p) => !recordByProductId.has(p.id))
      .map((p) => p.id);

    const previousFinalByProductId = new Map<number, number>();

    if (missingProductIds.length > 0) {
      // Get the most recent record before `date` for each missing product
      const previousRecords = await this.dailyRecordRepository
        .createQueryBuilder('r')
        .where('r.productId IN (:...ids)', { ids: missingProductIds })
        .andWhere('r.date < :date', { date })
        .orderBy('r.date', 'DESC')
        .getMany();

      // Keep only the latest one per product
      for (const rec of previousRecords) {
        if (!previousFinalByProductId.has(rec.productId)) {
          previousFinalByProductId.set(rec.productId, Number(rec.final));
        }
      }
    }

    // Group by family
    const grouped = new Map<
      number | string,
      { family: string; familyId?: number; products: any[] }
    >();

    for (const product of products) {
      const familyId = product.productFamilyId ?? 'ungrouped';
      const familyName = product.productFamily?.name ?? 'Sin familia';

      if (!grouped.has(familyId)) {
        grouped.set(familyId, {
          family: familyName,
          familyId: typeof familyId === 'number' ? familyId : undefined,
          products: [],
        });
      }

      const existingRecord = recordByProductId.get(product.id);

      const dailyRecord = existingRecord
        ? existingRecord
        : {
            id: null,
            date,
            productId: product.id,
            initial: previousFinalByProductId.get(product.id) ?? 0,
            incoming: 0,
            consumption: 0,
            waste: 0,
            homeConsumption: 0,
            final: 0,
            observations: null,
          };

      grouped.get(familyId).products.push({
        id: product.id,
        code: product.code,
        name: product.name,
        unitMeasure: product.unitMeasure,
        volume: product.volume,
        productFamilyId: product.productFamilyId,
        dailyRecord,
      });
    }

    return Array.from(grouped.values());
  }

  /**
   * Saves (upsert) all daily records for the given date.
   * Existing records for that date are updated; new ones are created.
   */
  async saveIpv(saveDto: SaveDailyIpvDto): Promise<ProductDailyRecord[]> {
    const { date, records } = saveDto;

    const saved: ProductDailyRecord[] = [];

    for (const item of records) {
      // Verify product exists
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with id ${item.productId} not found`,
        );
      }

      // Find existing or create new
      let record = await this.dailyRecordRepository.findOne({
        where: { productId: item.productId, date },
      });

      if (record) {
        Object.assign(record, {
          initial: item.initial ?? record.initial,
          incoming: item.incoming ?? record.incoming,
          consumption: item.consumption ?? record.consumption,
          waste: item.waste ?? record.waste,
          homeConsumption: item.homeConsumption ?? record.homeConsumption,
          final: item.final ?? record.final,
          observations: item.observations ?? record.observations,
        });
      } else {
        record = this.dailyRecordRepository.create({
          date,
          productId: item.productId,
          initial: item.initial ?? 0,
          incoming: item.incoming ?? 0,
          consumption: item.consumption ?? 0,
          waste: item.waste ?? 0,
          homeConsumption: item.homeConsumption ?? 0,
          final: item.final ?? 0,
          observations: item.observations,
        });
      }

      saved.push(await this.dailyRecordRepository.save(record));
    }

    return saved;
  }

  /**
   * Returns the daily record for a specific product on a specific date.
   */
  /**
   * Increments the consumption of a product on a specific date.
   * Useful when a sale is recorded in the billing module.
   */
  async updateDailyConsumption(
    productId: number,
    date: string,
    amount: number,
  ): Promise<ProductDailyRecord> {
    const product = await this.findOne(productId); // Ensure it exists

    let record = await this.getDailyRecordForProduct(productId, date);
    if (!record) {
      // Seed from previous day if it exists
      const previousRecords = await this.dailyRecordRepository
        .createQueryBuilder('r')
        .where('r.productId = :id', { id: productId })
        .andWhere('r.date < :date', { date })
        .orderBy('r.date', 'DESC')
        .getOne();

      record = this.dailyRecordRepository.create({
        date,
        productId,
        initial: previousRecords ? Number(previousRecords.final) : 0,
        incoming: 0,
        consumption: amount,
        waste: 0,
        homeConsumption: 0,
        final: (previousRecords ? Number(previousRecords.final) : 0) - amount,
      });
    } else {
      record.consumption = Number(record.consumption) + amount;
      record.final =
        Number(record.initial) +
        Number(record.incoming) -
        record.consumption -
        Number(record.waste) -
        Number(record.homeConsumption);
    }

    return await this.dailyRecordRepository.save(record);
  }

  async getDailyRecordForProduct(
    productId: number,
    date: string,
  ): Promise<ProductDailyRecord | null> {
    return this.dailyRecordRepository.findOne({
      where: { productId, date },
    });
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FindReviewsDto } from './dto/find-reviews.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly createRetryDelaysMs = [50, 150];

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const maxAttempts = this.createRetryDelaysMs.length + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        // Public submissions always require moderation. Never trust status or
        // an owner response supplied by a client.
        const review = this.reviewRepository.create({
          ...createReviewDto,
          response: null,
          status: ReviewStatus.INACTIVE,
        });

        return await this.reviewRepository.save(review);
      } catch (error: unknown) {
        const databaseError = this.getDatabaseError(error);

        if (this.isConcurrencyError(databaseError) && attempt < maxAttempts) {
          this.logger.warn(
            `Conflicto transitorio al crear una reseña. Reintento ${attempt + 1}/${maxAttempts}; ` +
              `dbCode=${databaseError.code ?? 'unknown'} errno=${databaseError.errno ?? 'unknown'}`,
          );
          await this.delay(this.createRetryDelaysMs[attempt - 1]);
          continue;
        }

        throw this.toCreateException(databaseError, maxAttempts);
      }
    }

    // The loop always returns or throws; this protects against future changes.
    throw new InternalServerErrorException({
      code: 'REVIEW_CREATION_UNEXPECTED_STATE',
      message: 'No se pudo completar la creación de la reseña.',
      operation: 'create_review',
      retryable: false,
    });
  }

  private getDatabaseError(error: unknown): DatabaseErrorDetails {
    if (!error || typeof error !== 'object') {
      return { original: error };
    }

    const outer = error as Record<string, unknown>;
    const driverError =
      outer.driverError && typeof outer.driverError === 'object'
        ? (outer.driverError as Record<string, unknown>)
        : outer;

    return {
      code: typeof driverError.code === 'string' ? driverError.code : undefined,
      errno:
        typeof driverError.errno === 'number' ? driverError.errno : undefined,
      sqlState:
        typeof driverError.sqlState === 'string'
          ? driverError.sqlState
          : undefined,
      message:
        typeof driverError.message === 'string'
          ? driverError.message
          : error instanceof Error
            ? error.message
            : undefined,
      original: error,
    };
  }

  private isConcurrencyError(error: DatabaseErrorDetails): boolean {
    return (
      ['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(error.code ?? '') ||
      [1205, 1213].includes(error.errno ?? -1)
    );
  }

  private toCreateException(
    error: DatabaseErrorDetails,
    attempts: number,
  ):
    | BadRequestException
    | ConflictException
    | InternalServerErrorException
    | ServiceUnavailableException {
    this.logger.error(
      `Fallo definitivo al crear una reseña: dbCode=${error.code ?? 'unknown'} ` +
        `errno=${error.errno ?? 'unknown'} sqlState=${error.sqlState ?? 'unknown'}`,
      error.original instanceof Error ? error.original.stack : undefined,
    );

    if (this.isConcurrencyError(error)) {
      return new ServiceUnavailableException({
        code: 'REVIEW_CREATION_CONCURRENCY_TIMEOUT',
        message:
          'La reseña no pudo guardarse porque la base de datos estaba ocupada por otros envíos. Inténtalo nuevamente en unos segundos.',
        details: {
          stage: 'database_write',
          reason: 'lock_conflict',
          attempts,
        },
        operation: 'create_review',
        retryable: true,
      });
    }

    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return new ConflictException({
        code: 'REVIEW_CREATION_DUPLICATE',
        message:
          'La reseña entra en conflicto con un registro ya existente y no pudo guardarse nuevamente.',
        details: { stage: 'database_write', reason: 'duplicate_record' },
        operation: 'create_review',
        retryable: false,
      });
    }

    if (
      [
        'ER_DATA_TOO_LONG',
        'ER_BAD_NULL_ERROR',
        'ER_TRUNCATED_WRONG_VALUE',
      ].includes(error.code ?? '') ||
      [1048, 1265, 1366, 1406].includes(error.errno ?? -1)
    ) {
      return new BadRequestException({
        code: 'REVIEW_CREATION_INVALID_DATA',
        message:
          'La base de datos rechazó uno de los campos de la reseña. Revisa las longitudes, los campos obligatorios y la puntuación.',
        details: { stage: 'database_write', reason: 'invalid_field_value' },
        operation: 'create_review',
        retryable: false,
      });
    }

    if (
      [
        'ER_CON_COUNT_ERROR',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'PROTOCOL_CONNECTION_LOST',
        'POOL_CLOSED',
      ].includes(error.code ?? '') ||
      error.errno === 1040
    ) {
      return new ServiceUnavailableException({
        code: 'REVIEW_DATABASE_UNAVAILABLE',
        message:
          'No se pudo conectar con la base de datos para guardar la reseña. El servicio está temporalmente saturado o no disponible.',
        details: {
          stage: 'database_connection',
          reason: 'database_unavailable',
        },
        operation: 'create_review',
        retryable: true,
      });
    }

    return new InternalServerErrorException({
      code: 'REVIEW_CREATION_FAILED',
      message:
        'Ocurrió un error inesperado mientras se guardaba la reseña. Usa el identificador de la respuesta para localizar el fallo en los registros del servidor.',
      details: { stage: 'database_write', reason: 'unexpected_database_error' },
      operation: 'create_review',
      retryable: false,
    });
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async findAll(findReviewsDto: FindReviewsDto): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page = 1, limit = 10 } = findReviewsDto;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .orderBy('review.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('review.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      reviews,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    Object.assign(review, updateReviewDto);

    return await this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  async changeStatus(id: number, status: ReviewStatus): Promise<Review> {
    const review = await this.findOne(id);
    review.status = status;
    return await this.reviewRepository.save(review);
  }

  async updateResponse(id: number, response: string | null): Promise<Review> {
    const review = await this.findOne(id);
    review.response = response;
    return await this.reviewRepository.save(review);
  }
}

interface DatabaseErrorDetails {
  code?: string;
  errno?: number;
  sqlState?: string;
  message?: string;
  original: unknown;
}

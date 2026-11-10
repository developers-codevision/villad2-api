import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

describe('ReviewsService.create', () => {
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let service: ReviewsService;

  const input = {
    name: 'Ana',
    country: 'Cuba',
    title: 'Excelente',
    content: 'Una estancia estupenda.',
    stars: 5,
  };

  beforeEach(() => {
    repository = {
      create: jest.fn((value) => value as Review),
      save: jest.fn(),
    };
    service = new ReviewsService(repository as unknown as Repository<Review>);
    jest
      .spyOn(service as unknown as { delay: () => Promise<void> }, 'delay')
      .mockResolvedValue(undefined);
    jest
      .spyOn(
        (service as unknown as { logger: { error: () => void } }).logger,
        'error',
      )
      .mockImplementation(() => undefined);
  });

  it('forces public reviews to pending without an owner response', async () => {
    const saved = { id: 10, ...input, status: ReviewStatus.INACTIVE } as Review;
    repository.save.mockResolvedValue(saved);

    await expect(service.create(input)).resolves.toBe(saved);
    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      response: null,
      status: ReviewStatus.INACTIVE,
    });
  });

  it('retries a deadlock and succeeds on the following attempt', async () => {
    const saved = { id: 11, ...input, status: ReviewStatus.INACTIVE } as Review;
    repository.save
      .mockRejectedValueOnce({
        driverError: { code: 'ER_LOCK_DEADLOCK', errno: 1213 },
      })
      .mockResolvedValueOnce(saved);

    await expect(service.create(input)).resolves.toBe(saved);
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('returns a retryable 503 after repeated lock conflicts', async () => {
    repository.save.mockRejectedValue({
      driverError: { code: 'ER_LOCK_WAIT_TIMEOUT', errno: 1205 },
    });

    const exception = await captureException(service.create(input));

    expect(exception).toBeInstanceOf(ServiceUnavailableException);
    expect(exception.getResponse()).toMatchObject({
      code: 'REVIEW_CREATION_CONCURRENCY_TIMEOUT',
      operation: 'create_review',
      retryable: true,
      details: { reason: 'lock_conflict', attempts: 3 },
    });
    expect(repository.save).toHaveBeenCalledTimes(3);
  });

  it('identifies duplicate records as a 409 conflict', async () => {
    repository.save.mockRejectedValue({
      driverError: { code: 'ER_DUP_ENTRY', errno: 1062 },
    });

    const exception = await captureException(service.create(input));

    expect(exception).toBeInstanceOf(ConflictException);
    expect(exception.getResponse()).toMatchObject({
      code: 'REVIEW_CREATION_DUPLICATE',
      retryable: false,
    });
  });

  it('identifies values rejected by MariaDB as a 400 error', async () => {
    repository.save.mockRejectedValue({
      driverError: { code: 'ER_DATA_TOO_LONG', errno: 1406 },
    });

    const exception = await captureException(service.create(input));

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception.getResponse()).toMatchObject({
      code: 'REVIEW_CREATION_INVALID_DATA',
      details: { reason: 'invalid_field_value' },
    });
  });

  it('keeps unknown database details out of the public 500 response', async () => {
    repository.save.mockRejectedValue(
      new Error('password=secret; SQL syntax near private_table'),
    );

    const exception = await captureException(service.create(input));

    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.getResponse()).toMatchObject({
      code: 'REVIEW_CREATION_FAILED',
      operation: 'create_review',
      retryable: false,
    });
    expect(JSON.stringify(exception.getResponse())).not.toContain('secret');
  });
});

async function captureException(
  promise: Promise<Review>,
): Promise<
  | BadRequestException
  | ConflictException
  | InternalServerErrorException
  | ServiceUnavailableException
> {
  try {
    await promise;
    throw new Error('Expected the operation to fail');
  } catch (error: unknown) {
    return error as
      | BadRequestException
      | ConflictException
      | InternalServerErrorException
      | ServiceUnavailableException;
  }
}

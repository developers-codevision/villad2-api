import { ArgumentsHost, ServiceUnavailableException } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  it('preserves structured diagnostics and adds a request identifier', () => {
    const json = jest.fn<void, [Record<string, unknown>]>();
    const setHeader = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { setHeader, status };
    const request = {
      method: 'POST',
      url: '/reviews',
      header: jest.fn().mockReturnValue(undefined),
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
    const filter = new AllExceptionsFilter();
    jest
      .spyOn(
        (filter as unknown as { logger: { error: () => void } }).logger,
        'error',
      )
      .mockImplementation(() => undefined);

    filter.catch(
      new ServiceUnavailableException({
        code: 'REVIEW_CREATION_CONCURRENCY_TIMEOUT',
        message: 'Base de datos ocupada.',
        details: { stage: 'database_write', reason: 'lock_conflict' },
        operation: 'create_review',
        retryable: true,
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 503,
        code: 'REVIEW_CREATION_CONCURRENCY_TIMEOUT',
        message: 'Base de datos ocupada.',
        operation: 'create_review',
        retryable: true,
        details: { stage: 'database_write', reason: 'lock_conflict' },
      }),
    );
    expect(typeof json.mock.calls[0][0].requestId).toBe('string');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', expect.any(String));
  });
});

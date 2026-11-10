import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { inspect } from 'util';

interface StructuredErrorResponse {
  message?: string | string[];
  code?: string;
  details?: unknown;
  operation?: string;
  retryable?: boolean;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let structuredError: Omit<StructuredErrorResponse, 'message'> = {};
    const incomingRequestId = request.header('x-request-id');
    const requestId = incomingRequestId?.trim() || randomUUID();

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as StructuredErrorResponse;
        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message || exception.message;
        structuredError = {
          ...(responseObj.code ? { code: responseObj.code } : {}),
          ...(responseObj.details !== undefined
            ? { details: responseObj.details }
            : {}),
          ...(responseObj.operation
            ? { operation: responseObj.operation }
            : {}),
          ...(typeof responseObj.retryable === 'boolean'
            ? { retryable: responseObj.retryable }
            : {}),
        };
      } else {
        message = exception.message;
      }

      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - Status: ${status} - ` +
          `Error: ${JSON.stringify({ message, ...structuredError })}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
        exception instanceof Error ? exception.stack : inspect(exception),
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      requestId,
      ...structuredError,
    };

    response.setHeader('x-request-id', requestId);
    response.status(status).json(errorResponse);
  }
}

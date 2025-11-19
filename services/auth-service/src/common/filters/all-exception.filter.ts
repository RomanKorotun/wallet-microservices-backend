import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(AllExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const status: number =
      exception instanceof HttpException ? exception.getStatus() : 500;

    let message: string | object = 'Server error';

    const request = host.switchToHttp().getRequest<Request>();

    const response = host.switchToHttp().getResponse<Response>();

    const url = request.url;

    if (exception instanceof HttpException) {
      const responseError = exception.getResponse() as
        | Record<string, string | string[]>
        | string;
      if (
        typeof responseError === 'object' &&
        responseError !== null &&
        'message' in responseError
      ) {
        message = responseError.message;
      } else if (typeof responseError === 'string') {
        message = responseError;
      }
    }

    this.logger.error(message, exception);

    response.status(status).json({
      status,
      message,
      url,
      timestamp: new Date().toISOString(),
    });
  }
}

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let error = 'Error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const errorResponse = exception.getResponse();
        
        if (typeof errorResponse === 'string') {
          message = errorResponse;
        } else if (typeof errorResponse === 'object') {
          message = (errorResponse as any).message || message;
          error = (errorResponse as any).error || error;
        }
      } else if (exception instanceof Error) {
        message = exception.message;
        this.logger.error(`Unhandled exception: ${exception.stack}`);
      }
  
      response.status(status).json({
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error,
        message,
      });
    }
  }
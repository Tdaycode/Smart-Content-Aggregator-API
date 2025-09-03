import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap, catchError } from 'rxjs/operators';
  import { CustomLoggerService } from '../logger/logger.service';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    constructor(private logger: CustomLoggerService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const start = Date.now();
  
      const requestId = Math.random().toString(36).substring(7);
      req.requestId = requestId;
  
      // Log incoming request
      this.logger.logWithMetadata('info', 'Incoming request', {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body,
        query: req.query,
        params: req.params,
      });
  
      return next.handle().pipe(
        tap(() => {
          const duration = Date.now() - start;
          
          // Log successful response
          this.logger.logWithMetadata('info', 'Request completed', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
          });
        }),
        catchError((error) => {
          const duration = Date.now() - start;
          
          // Log error response
          this.logger.logWithMetadata('error', 'Request failed', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: error.status || 500,
            duration: `${duration}ms`,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          });
          
          throw error;
        }),
      );
    }
  }
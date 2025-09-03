import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { MetricsService } from '../../modules/metrics/metrics.service';
  
  @Injectable()
  export class MetricsInterceptor implements NestInterceptor {
    constructor(private metricsService: MetricsService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const start = Date.now();
  
      return next.handle().pipe(
        tap({
          next: () => {
            const duration = (Date.now() - start) / 1000;
            this.metricsService.recordHttpRequest(
              req.method,
              req.route?.path || req.url,
              res.statusCode,
              duration,
            );
          },
          error: (error) => {
            const duration = (Date.now() - start) / 1000;
            this.metricsService.recordHttpRequest(
              req.method,
              req.route?.path || req.url,
              error.status || 500,
              duration,
            );
            this.metricsService.recordHttpError(
              req.method,
              req.route?.path || req.url,
              error.name || 'UnknownError',
            );
          },
        }),
      );
    }
  }
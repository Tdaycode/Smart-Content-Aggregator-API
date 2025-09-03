import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  import * as Sentry from '@sentry/node';
  
  @Injectable()
  export class SentryInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      // Only use Sentry if it's configured
      if (!process.env.SENTRY_DSN) {
        return next.handle();
      }
  
      const request = context.switchToHttp().getRequest();
      
      // Create a new Sentry scope for this request
      return Sentry.withScope((scope) => {
        // Set user context if available
        const user = request.user;
        if (user) {
          scope.setUser({
            id: user.id,
            username: user.username,
            email: user.email,
          });
        }
  
        // Add request context
        scope.setContext('request', {
          url: request.url,
          method: request.method,
          headers: this.sanitizeHeaders(request.headers),
          query: request.query,
          params: request.params,
        });
  
        // Add custom tags
        scope.setTag('request.id', request.requestId || 'unknown');
        scope.setTag('endpoint', `${request.method} ${request.route?.path || request.url}`);
  
        return next.handle().pipe(
          catchError((error) => {
            // Only send to Sentry if it's not a client error (4xx)
            if (this.shouldCaptureError(error)) {
              // Capture the exception with additional context
              Sentry.captureException(error, {
                extra: {
                  request: {
                    url: request.url,
                    method: request.method,
                    body: this.sanitizeBody(request.body),
                    user: request.user?.id || 'anonymous',
                  },
                },
              });
            }
            
            return throwError(() => error);
          }),
        );
      });
    }
  
    private shouldCaptureError(error: any): boolean {
      // Don't capture client errors (4xx)
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return status >= 500;
      }
      
      // Capture all non-HTTP exceptions
      return true;
    }
  
    private sanitizeHeaders(headers: any): any {
      const sanitized = { ...headers };
      // Remove sensitive headers
      delete sanitized.authorization;
      delete sanitized.cookie;
      delete sanitized['x-api-key'];
      return sanitized;
    }
  
    private sanitizeBody(body: any): any {
      if (!body) return body;
      
      const sanitized = { ...body };
      // Remove sensitive fields
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.apiKey;
      return sanitized;
    }
  }
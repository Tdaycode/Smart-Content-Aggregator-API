import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { RequestHandler, ErrorRequestHandler } from 'express';

export function initSentry(): void {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      sendDefaultPii: true,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new ProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.authorization;
        }
        
        // Don't send events in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
          return null;
        }
        
        return event;
      },
    });

    console.log('✅ Sentry initialized successfully');
  } else {
    console.log('⚠️  Sentry DSN not provided, skipping initialization');
  }
}

export function getSentryRequestHandler(): RequestHandler {
  if (process.env.SENTRY_DSN) {
    return Sentry.Handlers.requestHandler() as RequestHandler;
  }
  // Return a no-op middleware if Sentry is not configured
  return (req, res, next) => next();
}

export function getSentryErrorHandler(): ErrorRequestHandler {
  if (process.env.SENTRY_DSN) {
    return Sentry.Handlers.errorHandler() as ErrorRequestHandler;
  }
  // Return a no-op middleware if Sentry is not configured
  return (err, req, res, next) => next(err);
}
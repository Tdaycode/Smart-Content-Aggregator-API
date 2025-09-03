import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { winstonConfig } from './common/logger/winston.config';
import { CustomLoggerService } from './common/logger/logger.service';
import { MetricsService } from './modules/metrics/metrics.service';
import { initSentry } from './common/sentry/sentry.config';

async function bootstrap() {
  // Initialize Sentry
  initSentry();

  // Create app with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);
  const logger = app.get(CustomLoggerService);
  const metricsService = app.get(MetricsService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(logger),
    new MetricsInterceptor(metricsService),
    new SentryInterceptor(),
  );

  // CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  // Swagger documentation
  setupSwagger(app);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error.stack, 'Main');
    Sentry.captureException(error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason as string, 'Main');
    Sentry.captureException(reason);
  });

  const port = configService.get('port') || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`, 'Main');
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`, 'Main');
  logger.log(`💊 Health Check: http://localhost:${port}/api/v1/health`, 'Main');
  logger.log(`📊 Metrics: http://localhost:${port}/api/v1/metrics`, 'Main');
}

bootstrap();
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import configuration from './config/configuration';
import { winstonConfig } from './common/logger/winston.config';
import { CustomLoggerService } from './common/logger/logger.service';
import { ArticlesModule } from './modules/articles/articles.module';
import { UsersModule } from './modules/users/users.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AiSummaryModule } from './modules/ai-summary/ai-summary.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { getSentryErrorHandler, getSentryRequestHandler } from './common/sentry/sentry.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(winstonConfig),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        connectionFactory: (connection) => {
          connection.plugin(require('mongoose-autopopulate'));
          
          // Log database events
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          
          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });
          
          connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
          });
          
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ArticlesModule,
    UsersModule,
    InteractionsModule,
    RecommendationsModule,
    AiSummaryModule,
    HealthModule,
    MetricsModule,
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Sentry request handler to all routes
    consumer
      .apply(getSentryRequestHandler())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    
    // consumer
    //   .apply(getSentryErrorHandler())
    //   .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
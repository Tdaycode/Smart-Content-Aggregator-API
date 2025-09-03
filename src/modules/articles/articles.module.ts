import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article, ArticleSchema } from './schemas/article.schema';
import { AiSummaryModule } from '../ai-summary/ai-summary.module';
import { CustomLoggerService } from '@/common/logger/logger.service';
import { MetricsService } from '../metrics/metrics.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    AiSummaryModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, CustomLoggerService, MetricsService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
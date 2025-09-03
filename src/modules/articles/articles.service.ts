import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AiSummaryService } from '../ai-summary/ai-summary.service';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    private aiSummaryService: AiSummaryService,
    private logger: CustomLoggerService,
    private metricsService: MetricsService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<ArticleDocument> {
    const startTime = Date.now();
    const articleData = { ...createArticleDto };
    let aiSummaryGenerated = false;

    // Generate AI summary if not provided
    if (!articleData.summary || articleData.summary.trim() === '') {
      this.logger.log('Generating AI summary for article', 'ArticlesService');
      
      try {
        const generatedSummary = await this.aiSummaryService.generateSummary(
          articleData.content,
          articleData.title,
        );
        articleData.summary = generatedSummary;
        articleData['isAiGenerated'] = true;
        aiSummaryGenerated = true;
        
        this.metricsService.recordAiSummaryGenerated('openai', true);
        this.logger.log('AI summary generated successfully', 'ArticlesService');
      } catch (error) {
        this.logger.error('Failed to generate AI summary', error.stack, 'ArticlesService');
        this.metricsService.recordAiSummaryGenerated('openai', false);
        
        // Fallback to extractive summary
        articleData.summary = this.extractSummary(articleData.content);
        articleData['isAiGenerated'] = false;
      }
    }

    // Extract tags from content if not provided
    if (!articleData.tags || articleData.tags.length === 0) {
      articleData.tags = this.extractTags(articleData.content);
    }

    try {
      const createdArticle = new this.articleModel(articleData);
      const savedArticle = await createdArticle.save();
      
      // Record metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordDbQuery('create', 'articles', duration);
      this.metricsService.recordArticleCreated(aiSummaryGenerated);
      
      this.logger.logWithMetadata('info', 'Article created successfully', {
        articleId: savedArticle._id,
        title: savedArticle.title,
        aiSummary: aiSummaryGenerated,
        duration: `${duration}s`,
      });
      
      return savedArticle;
    } catch (error) {
      this.logger.error('Failed to create article', error.stack, 'ArticlesService');
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Article>> {
    const startTime = Date.now();
    const { limit = 10, offset = 0, tags, author } = paginationDto;
    
    const filter: FilterQuery<ArticleDocument> = {};
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    if (author) {
      filter.author = new RegExp(author, 'i');
    }

    try {
      const [items, total] = await Promise.all([
        this.articleModel
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .exec(),
        this.articleModel.countDocuments(filter),
      ]);

      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordDbQuery('find', 'articles', duration);
      
      this.logger.logWithMetadata('debug', 'Articles retrieved', {
        count: items.length,
        total,
        filter,
        duration: `${duration}s`,
      });

      return {
        items,
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve articles', error.stack, 'ArticlesService');
      throw error;
    }
  }

  async findOne(id: string): Promise<Article> {
    const startTime = Date.now();
    
    try {
      const article = await this.articleModel.findById(id).exec();
      
      if (!article) {
        this.logger.warn(`Article not found: ${id}`, 'ArticlesService');
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      // Increment view count
      await this.articleModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordDbQuery('findOne', 'articles', duration);
      
      this.logger.logWithMetadata('debug', 'Article retrieved', {
        articleId: id,
        title: article.title,
        duration: `${duration}s`,
      });

      return article;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve article ${id}`, error.stack, 'ArticlesService');
      throw error;
    }
  }

  private extractSummary(content: string, maxLength: number = 200): string {
    const paragraphs = content.split('\n\n').filter(p => p.length > 50);
    
    if (paragraphs.length > 0) {
      const firstParagraph = paragraphs[0];
      if (firstParagraph.length <= maxLength) {
        return firstParagraph;
      }
      return firstParagraph.substring(0, maxLength).trim() + '...';
    }
    
    return content.substring(0, maxLength).trim() + '...';
  }

  private extractTags(content: string): string[] {
    const techKeywords = [
      'javascript', 'typescript', 'nodejs', 'react', 'angular', 'vue',
      'python', 'java', 'golang', 'rust', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'devops', 'ci/cd', 'microservices',
      'api', 'database', 'mongodb', 'postgresql', 'redis',
      'machine learning', 'ai', 'blockchain', 'web3', 'security',
    ];

    const contentLower = content.toLowerCase();
    const foundTags = techKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );

    return foundTags.slice(0, 5);
  }
}
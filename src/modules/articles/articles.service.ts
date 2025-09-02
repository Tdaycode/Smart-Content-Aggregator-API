import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AiSummaryService } from '../ai-summary/ai-summary.service';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    private aiSummaryService: AiSummaryService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
   
    const articleData = { ...createArticleDto };

    // Generate AI summary if not provided
    if (!articleData.summary || articleData.summary.trim() === '') {
      this.logger.log('Generating AI summary for article');
      try {
        const generatedSummary = await this.aiSummaryService.generateSummary(
          articleData.content,
          articleData.title,
        );
        articleData.summary = generatedSummary;
        articleData['isAiGenerated'] = true;
      } catch (error) {
        this.logger.error('Failed to generate AI summary', error);
        // Fallback to extractive summary
        articleData.summary = this.extractSummary(articleData.content);
        articleData['isAiGenerated'] = false;
      }
    }

    // Extract tags from content if not provided
    if (!articleData.tags || articleData.tags.length === 0) {
      articleData.tags = this.extractTags(articleData.content);
    }

 

    const createdArticle = new this.articleModel(articleData);
    console.log("here")
    return createdArticle.save();
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Article>> {
    const { limit = 10, offset = 0, tags, author } = paginationDto;
    
    const filter: FilterQuery<ArticleDocument> = {};
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    if (author) {
      filter.author = new RegExp(author, 'i');
    }

    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean() 
        .exec(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      hasPrevious: offset > 0,
    };
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();
    
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Increment view count
    await this.articleModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return article;
  }

  private extractSummary(content: string, maxLength: number = 200): string {
    // Simple extractive summary: take first paragraph or first N characters
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
    // Simple tag extraction based on common tech keywords
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

    return foundTags.slice(0, 5); // Limit to 5 tags
  }
}
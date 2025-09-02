import { 
  Injectable, 
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interaction, InteractionDocument } from './schemas/interaction.schema';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { Article, ArticleDocument } from '../articles/schemas/article.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);

  constructor(
    @InjectModel(Interaction.name) 
    private interactionModel: Model<InteractionDocument>,
    @InjectModel(Article.name) 
    private articleModel: Model<ArticleDocument>,
    private usersService: UsersService,
  ) {}

  async create(createInteractionDto: CreateInteractionDto): Promise<Interaction> {
    const { userId, articleId, interactionType } = createInteractionDto;

    // Validate user and article exist
    await this.validateUserAndArticle(userId, articleId);

    try {
      const interaction = new this.interactionModel(createInteractionDto);
      const savedInteraction = await interaction.save();

      // Update article metrics
      if (interactionType === 'view') {
        await this.articleModel.findByIdAndUpdate(
          articleId,
          { $inc: { viewCount: 1 } },
        );
      } else if (interactionType === 'like') {
        await this.articleModel.findByIdAndUpdate(
          articleId,
          { $inc: { likeCount: 1 } },
        );
      }

      // Update user interaction count
      await this.usersService.incrementInteractionCount(userId);

      this.logger.log(
        `Interaction recorded: ${interactionType} by user ${userId} on article ${articleId}`,
      );

      return savedInteraction;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'This interaction has already been recorded',
        );
      }
      throw error;
    }
  }

  async findByUser(
    userId: string,
    interactionType?: string,
  ): Promise<Interaction[]> {
    const filter: any = { userId };
    
    if (interactionType) {
      filter.interactionType = interactionType;
    }

    return this.interactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async findByArticle(articleId: string): Promise<Interaction[]> {
    return this.interactionModel
      .find({ articleId })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  private async validateUserAndArticle(
    userId: string,
    articleId: string,
  ): Promise<void> {
    try {
      await this.usersService.findOne(userId);
    } catch (error) {
      throw new BadRequestException('Invalid user ID');
    }

    const article = await this.articleModel.findById(articleId);
    if (!article) {
      throw new BadRequestException('Invalid article ID');
    }
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../articles/schemas/article.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Interaction, InteractionDocument } from '../interactions/schemas/interaction.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Interaction.name) private interactionModel: Model<InteractionDocument>,
  ) {}

  async getRecommendations(userId: string, limit: number = 10): Promise<ArticleDocument[]> {
    // Verify user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get user's interaction history
    const userInteractions = await this.interactionModel
      .find({ userId })
      .select('articleId')
      .exec();
    
    const viewedArticleIds = userInteractions.map(i => i.articleId.toString());

    // Strategy 1: Interest-based recommendations
    const interestBasedArticles = await this.getInterestBasedRecommendations(
      user,
      viewedArticleIds,
      Math.ceil(limit * 0.6),
    );

    // Strategy 2: Popular articles the user hasn't seen
    const popularArticles = await this.getPopularRecommendations(
      viewedArticleIds,
      Math.floor(limit * 0.4),
    );

    // Combine and deduplicate
    const recommendedArticles = this.deduplicateArticles([
      ...interestBasedArticles,
      ...popularArticles,
    ]);

    return recommendedArticles.slice(0, limit);
  }

  private async getInterestBasedRecommendations(
    user: UserDocument,
    excludeIds: string[],
    limit: number,
  ): Promise<ArticleDocument[]> {
    if (!user.interests || user.interests.length === 0) {
      return [];
    }

    return this.articleModel
      .find({
        _id: { $nin: excludeIds },
        tags: { $in: user.interests },
      })
      .sort({ createdAt: -1, likeCount: -1 })
      .limit(limit)
      .exec();
  }

  private async getPopularRecommendations(
    excludeIds: string[],
    limit: number,
  ): Promise<ArticleDocument[]> {
    return this.articleModel
      .find({
        _id: { $nin: excludeIds },
      })
      .sort({ likeCount: -1, viewCount: -1, createdAt: -1 })
      .limit(limit)
      .exec();
  }

  private deduplicateArticles(articles: ArticleDocument[]): ArticleDocument[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const id = article._id.toString();
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }
}
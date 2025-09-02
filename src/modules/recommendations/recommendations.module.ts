import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Interaction, InteractionSchema } from '../interactions/schemas/interaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: User.name, schema: UserSchema },
      { name: Interaction.name, schema: InteractionSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
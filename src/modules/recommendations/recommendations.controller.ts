import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

import { ArticleResponseDto } from '../articles/dto/article-response.dto';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseInterceptors(ClassSerializerInterceptor)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get(':userId')
  @ApiOperation({ 
    summary: 'Get personalized article recommendations for a user',
    description: 'Returns a list of recommended articles based on user interests and popular content',
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'User ID to get recommendations for',
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of recommendations to return (default: 10, max: 50)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of recommended articles',
    type: RecommendationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getRecommendations(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ): Promise<RecommendationResponseDto> {
    const validLimit = Math.min(limit || 10, 50);
    
    const articles = await this.recommendationsService.getRecommendations(
      userId,
      validLimit,
    );
    const recommendations = articles.map(article => 
      new ArticleResponseDto(article)
    );

    return new RecommendationResponseDto({
      recommendations,
      total: recommendations.length,
      strategy: 'hybrid',
      confidence: 0.85,
    });
  }
}
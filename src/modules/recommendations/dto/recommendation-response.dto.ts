import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from '../../articles/dto/article-response.dto';

export class RecommendationResponseDto {
  @ApiProperty({
    description: 'List of recommended articles',
    type: [ArticleResponseDto],
  })
  recommendations: ArticleResponseDto[];

  @ApiProperty({
    description: 'Total number of recommendations available',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Recommendation strategy used',
    example: 'hybrid',
    enum: ['interest-based', 'popularity-based', 'hybrid'],
  })
  strategy: string;

  @ApiProperty({
    description: 'Confidence score of recommendations',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  constructor(partial: Partial<RecommendationResponseDto>) {
    Object.assign(this, partial);
  }
}
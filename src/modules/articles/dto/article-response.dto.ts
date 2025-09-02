import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class ArticleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the article',
    example: '507f1f77bcf86cd799439011',
  })
  @Expose()
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  id: string | Types.ObjectId;

  @ApiProperty({
    description: 'Article title',
    example: 'Understanding Microservices Architecture',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Full article content',
    example: 'Microservices architecture is a design pattern...',
  })
  @Expose()
  content: string;

  @ApiProperty({
    description: 'Author name',
    example: 'John Doe',
  })
  @Expose()
  author: string;

  @ApiProperty({
    description: 'Article summary',
    example: 'This article explores the key concepts of microservices...',
  })
  @Expose()
  summary: string;

  @ApiProperty({
    description: 'Article tags for categorization',
    type: [String],
    example: ['technology', 'backend', 'architecture'],
  })
  @Expose()
  tags: string[];

  @ApiProperty({
    description: 'Number of views',
    example: 42,
  })
  @Expose()
  viewCount: number;

  @ApiProperty({
    description: 'Number of likes',
    example: 15,
  })
  @Expose()
  likeCount: number;

  @ApiProperty({
    description: 'Indicates if the summary was AI-generated',
    example: true,
  })
  @Expose()
  isAiGenerated: boolean;

  @ApiProperty({
    description: 'Article creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T14:45:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ArticleResponseDto>) {
    Object.assign(this, partial);
  }
}
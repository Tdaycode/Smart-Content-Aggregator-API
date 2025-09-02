import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'Understanding Microservices Architecture',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Full article content',
    example: 'Microservices architecture is a design pattern...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  content: string;

  @ApiProperty({
    description: 'Author name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({
    description: 'Article summary (auto-generated if not provided)',
    example: 'This article explores the key concepts of microservices...',
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({
    description: 'Article tags for categorization',
    example: ['technology', 'backend', 'architecture'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
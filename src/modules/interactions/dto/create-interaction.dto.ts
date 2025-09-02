import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsMongoId } from 'class-validator';

export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  SHARE = 'share',
  BOOKMARK = 'bookmark',
}

export class CreateInteractionDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Article ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  articleId: string;

  @ApiProperty({
    description: 'Type of interaction',
    enum: InteractionType,
    example: InteractionType.VIEW,
  })
  @IsEnum(InteractionType)
  @IsNotEmpty()
  interactionType: InteractionType;
}
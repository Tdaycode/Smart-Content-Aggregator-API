import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class InteractionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the interaction',
    example: '507f1f77bcf86cd799439011',
  })
  @Expose()
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  id: string | Types.ObjectId;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439012',
  })
  @Expose()
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  userId: string | Types.ObjectId;

  @ApiProperty({
    description: 'Article ID',
    example: '507f1f77bcf86cd799439013',
  })
  @Expose()
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  articleId: string | Types.ObjectId;

  @ApiProperty({
    description: 'Type of interaction',
    example: 'view',
    enum: ['view', 'like', 'share', 'bookmark'],
  })
  @Expose()
  interactionType: string;

  @ApiProperty({
    description: 'Interaction timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<InteractionResponseDto>) {
    Object.assign(this, partial);
  }
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @Expose()
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  id: string | Types.ObjectId;

  @ApiProperty({
    description: 'Unique username',
    example: 'johndoe123',
  })
  @Expose()
  username: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john@example.com',
  })
  @Expose()
  email?: string;

  @ApiProperty({
    description: 'User interests for personalized recommendations',
    type: [String],
    example: ['javascript', 'cloud', 'devops'],
  })
  @Expose()
  interests: string[];

  @ApiProperty({
    description: 'Number of articles created by the user',
    example: 5,
  })
  @Expose()
  articleCount: number;

  @ApiProperty({
    description: 'Number of interactions by the user',
    example: 25,
  })
  @Expose()
  interactionCount: number;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-10T08:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T14:45:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
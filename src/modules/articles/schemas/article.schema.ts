import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';


export type ArticleDocument =HydratedDocument<Article>;

@Schema({
  timestamps: true,
})
export class Article {
  @Prop({ required: true, index: true })
  @ApiProperty()
  title: string;

  @Prop({ required: true })
  @ApiProperty()
  content: string;

  @Prop({ required: true, index: true })
  @ApiProperty()
  author: string;

  @Prop({ default: null })
  @ApiProperty({ required: false })
  summary?: string;

  @Prop({ type: [String], default: [], index: true })
  @ApiProperty({ type: [String] })
  tags: string[];

  @Prop({ default: 0 })
  @ApiProperty()
  viewCount: number;

  @Prop({ default: 0 })
  @ApiProperty()
  likeCount: number;

  @Prop({ default: false })
  @ApiProperty()
  isAiGenerated: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
  
  ArticleSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ tags: 1, createdAt: -1 });
ArticleSchema.index({ author: 1, createdAt: -1 });
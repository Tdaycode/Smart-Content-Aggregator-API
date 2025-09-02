import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type InteractionDocument = Interaction & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class Interaction {
  @ApiProperty()
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  @ApiProperty()
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Article', required: true, index: true })
  @ApiProperty()
  articleId: Types.ObjectId;

  @Prop({ required: true, enum: ['view', 'like', 'share', 'bookmark'] })
  @ApiProperty()
  interactionType: string;

  @ApiProperty()
  createdAt: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);

// Compound index for unique interactions
InteractionSchema.index({ userId: 1, articleId: 1, interactionType: 1 }, { unique: true });
InteractionSchema.index({ createdAt: -1 });
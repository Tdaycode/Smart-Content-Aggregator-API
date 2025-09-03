import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type InteractionDocument = HydratedDocument<Interaction>;

@Schema({
  timestamps: true,
})
export class Interaction {
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

InteractionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
  
  InteractionSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
// Compound index for unique interactions
InteractionSchema.index({ userId: 1, articleId: 1, interactionType: 1 }, { unique: true });
InteractionSchema.index({ createdAt: -1 });
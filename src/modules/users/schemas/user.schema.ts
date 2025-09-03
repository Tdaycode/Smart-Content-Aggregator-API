import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @ApiProperty()
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  @ApiProperty()
  username: string;

  @Prop({ sparse: true, index: true })
  @ApiProperty({ required: false })
  email?: string;

  @Prop({ type: [String], default: [] })
  @ApiProperty({ type: [String] })
  interests: string[];

  @Prop({ default: 0 })
  @ApiProperty()
  articleCount: number;

  @Prop({ default: 0 })
  @ApiProperty()
  interactionCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.index({ username: 1 });
UserSchema.index({ interests: 1 });
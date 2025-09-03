import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
})
export class User {
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

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
  
  UserSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
UserSchema.index({ interests: 1 });

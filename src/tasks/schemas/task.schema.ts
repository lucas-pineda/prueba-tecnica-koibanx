import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true })
export class Task {
  @Transform(({ value }) => value.toString())
  _id: string;
  
  @Prop({ required: true })
  filePath: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'processing' | 'done' | 'error';

  @Prop({ default: 0 })
  errorCount: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
  
}

export const TaskSchema = SchemaFactory.createForClass(Task);

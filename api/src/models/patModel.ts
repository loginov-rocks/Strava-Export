import { model, Schema, Types } from 'mongoose';

export interface PatSchema {
  userId: string;
  name: string;
  hash: string;
  display: string;
  lastUsedAt?: Date;
}

export interface PatDocument extends PatSchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<PatDocument>({
  userId: String,
  name: String,
  hash: String,
  display: String,
  lastUsedAt: Date,
}, {
  timestamps: true,
});

export const patModel = model<PatDocument>('Pat', schema);

export type PatModel = typeof patModel;

import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface PatData {
  hash: string;
  userId: string;
  name: string;
  display: string;
  lastUsedAt?: Date;
}

export interface PatDocument extends BaseDocument, PatData { }

const schema = createBaseSchema<PatDocument>({
  hash: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  display: {
    type: String,
    required: true,
  },
  lastUsedAt: Date,
});

schema.index({ hash: 1 }, { unique: true });
schema.index({ userId: 1 });

export const patModel = model<PatDocument>('Pat', schema);

export type PatModel = typeof patModel;

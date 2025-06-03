import { model, Schema, Types } from 'mongoose';

export interface SyncJobParams {
  refreshLastDays?: number;
}

export interface SyncJobCompletedResult {
  pagesCount: number;
  perPageCount: number;
  processedCount: number;
  existingCount: number;
  nonExistingCount: number;
  insertedCount: number;
  noDetailsCount: number;
  refreshDetailsCount: number;
  detailsProcessedCount: number;
  detailsUpdatedCount: number;
}

export interface SyncJobSchema {
  userId: string;
  status: 'created' | 'started' | 'completed' | 'failed';
  params?: SyncJobParams;
  startedAt?: Date;
  completedAt?: Date;
  completedResult?: SyncJobCompletedResult;
  failedAt?: Date;
  failedError?: {
    message: string;
    stack?: string;
  };
}

export interface SyncJobDocument extends SyncJobSchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<SyncJobDocument>({
  userId: String,
  status: {
    type: String,
    enum: ['created', 'started', 'completed', 'failed'],
  },
  params: {
    refreshLastDays: Number,
  },
  startedAt: Date,
  completedAt: Date,
  completedResult: Schema.Types.Mixed,
  failedAt: Date,
  failedError: {
    message: String,
    stack: String,
  },
}, {
  timestamps: true,
});

export const syncJobModel = model<SyncJobDocument>('SyncJob', schema);

export type SyncJobModel = typeof syncJobModel;

import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

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

export interface SyncJobData {
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

export interface SyncJobDocument extends BaseDocument, SyncJobData { }

const schema = createBaseSchema<SyncJobDocument>({
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['created', 'started', 'completed', 'failed'],
    required: true,
  },
  params: {
    refreshLastDays: Number,
  },
  startedAt: Date,
  completedAt: Date,
  completedResult: {
    _id: false,
    type: {
      pagesCount: {
        type: Number,
        required: true,
      },
      perPageCount: {
        type: Number,
        required: true,
      },
      processedCount: {
        type: Number,
        required: true,
      },
      existingCount: {
        type: Number,
        required: true,
      },
      nonExistingCount: {
        type: Number,
        required: true,
      },
      insertedCount: {
        type: Number,
        required: true,
      },
      noDetailsCount: {
        type: Number,
        required: true,
      },
      refreshDetailsCount: {
        type: Number,
        required: true,
      },
      detailsProcessedCount: {
        type: Number,
        required: true,
      },
      detailsUpdatedCount: {
        type: Number,
        required: true,
      },
    },
  },
  failedAt: Date,
  failedError: {
    _id: false,
    type: {
      message: {
        type: String,
        required: true,
      },
      stack: String,
    },
  },
});

schema.index({ userId: 1 });

export const syncJobModel = model<SyncJobDocument>('SyncJob', schema);

export type SyncJobModel = typeof syncJobModel;

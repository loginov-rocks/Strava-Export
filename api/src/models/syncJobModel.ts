import { model, Schema } from 'mongoose';

const schema = new Schema({
  userId: String,
  status: {
    type: String,
    enum: ['created', 'started', 'completed', 'failed'],
    default: 'created',
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

export const syncJobModel = model('SyncJob', schema);

export type SyncJobModel = typeof syncJobModel;

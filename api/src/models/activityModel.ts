import { model, Schema } from 'mongoose';

import { StravaDetailedActivity, StravaSummaryActivity } from '../apiClients/StravaApiClient';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface ActivityData {
  stravaActivityId: string;
  userId: string;
  stravaData: StravaDetailedActivity | StravaSummaryActivity;
  hasDetails: boolean;
}

export interface ActivityDocument extends BaseDocument, ActivityData { }

const schema = createBaseSchema<ActivityDocument>({
  stravaActivityId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  stravaData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  hasDetails: {
    type: Boolean,
    required: true,
  },
});

schema.index({ stravaActivityId: 1 }, { unique: true });
schema.index({ userId: 1 });

export const activityModel = model<ActivityDocument>('Activity', schema);

export type ActivityModel = typeof activityModel;

import { model, Schema, Types } from 'mongoose';

import { StravaDetailedActivity, StravaSummaryActivity } from '../apiClients/StravaApiClient';

export interface ActivitySchema {
  userId: string;
  hasDetails: boolean;
  stravaActivityId: string;
  stravaData: StravaDetailedActivity | StravaSummaryActivity;
}

export interface ActivityDocument extends ActivitySchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ActivityDocument>({
  userId: String,
  hasDetails: Boolean,
  stravaActivityId: String,
  stravaData: Schema.Types.Mixed,
}, {
  timestamps: true,
});

export const activityModel = model<ActivityDocument>('Activity', schema);

export type ActivityModel = typeof activityModel;

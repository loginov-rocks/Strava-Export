import { model, Schema } from 'mongoose';

const schema = new Schema({
  userId: String,
  hasDetails: Boolean,
  stravaActivityId: String,
  stravaData: Schema.Types.Mixed,
}, {
  timestamps: true,
});

export const activityModel = model('Activity', schema);

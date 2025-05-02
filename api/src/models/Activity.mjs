import { model, Schema } from 'mongoose';

const schema = new Schema({
  activityId: String,
  athleteId: String,
  hasDetails: Boolean,
}, {
  // Allow Mongoose to save arbitrary fields retrieved from Strava.
  strict: false,
});

export const Activity = model('Activity', schema);

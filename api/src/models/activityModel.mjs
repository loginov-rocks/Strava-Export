import { model, Schema } from 'mongoose';

const schema = new Schema({
  userId: String,
  activityId: String,
  hasDetails: Boolean,
}, {
  // Allow Mongoose to save arbitrary fields retrieved from Strava.
  strict: false,
});

export const activityModel = model('Activity', schema);

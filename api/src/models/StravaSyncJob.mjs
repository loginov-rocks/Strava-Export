import { model, Schema } from 'mongoose';

const schema = new Schema({
  athleteId: String,
  accessToken: String,
});

export const StravaSyncJob = model('StravaSyncJob', schema);

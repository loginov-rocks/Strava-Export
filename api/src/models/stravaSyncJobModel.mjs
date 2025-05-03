import { model, Schema } from 'mongoose';

const schema = new Schema({
  athleteId: String,
  accessToken: String,
});

export const stravaSyncJobModel = model('StravaSyncJob', schema);

import mongoose from 'mongoose';

export const StravaSyncJob = mongoose.model('StravaSyncJob', {
  athleteId: String,
  accessToken: String,
});

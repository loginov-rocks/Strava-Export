import { model, Schema } from 'mongoose';

const schema = new Schema({
  stravaAthleteId: String,
  stravaToken: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
  },
}, {
  timestamps: true,
});

export const userModel = model('User', schema);

export type UserModel = typeof userModel;

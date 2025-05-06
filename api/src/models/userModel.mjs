import { model, Schema } from 'mongoose';

const schema = new Schema({
  athleteId: String,
  token: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
  },
}, {
  timestamps: true,
});

export const userModel = model('User', schema);

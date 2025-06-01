import { model, Schema, Types } from 'mongoose';

export interface UserSchema {
  stravaAthleteId: string;
  stravaToken: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
}

export interface UserDocument extends UserSchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<UserDocument>({
  stravaAthleteId: String,
  stravaToken: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
  },
}, {
  timestamps: true,
});

export const userModel = model<UserDocument>('User', schema);

export type UserModel = typeof userModel;

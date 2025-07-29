import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface UserData {
  stravaAthleteId: string;
  stravaToken: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
}

export interface UserDocument extends BaseDocument, UserData { }

const schema = createBaseSchema<UserDocument>({
  stravaAthleteId: {
    type: String,
    required: true,
  },
  stravaToken: {
    _id: false,
    type: {
      accessToken: {
        type: String,
        required: true,
      },
      refreshToken: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
    required: true,
  },
});

schema.index({ stravaAthleteId: 1 }, { unique: true });

export const userModel = model<UserDocument>('User', schema);

export type UserModel = typeof userModel;

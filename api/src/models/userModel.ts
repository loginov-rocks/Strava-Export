import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface UserData {
  stravaAthleteId: string;
  stravaToken: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  isPublic: boolean;
  stravaProfile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    city?: string;
    state?: string;
    country?: string;
    avatarUrl?: string;
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
  isPublic: {
    type: Boolean,
    required: true,
  },
  stravaProfile: {
    _id: false,
    type: {
      firstName: String,
      lastName: String,
      bio: String,
      city: String,
      state: String,
      country: String,
      avatarUrl: String,
    },
  },
});

schema.index({ stravaAthleteId: 1 }, { unique: true });

export const userModel = model<UserDocument>('User', schema);

export type UserModel = typeof userModel;

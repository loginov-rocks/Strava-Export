import { randomUUID } from 'crypto';
import { Document, model, Schema } from 'mongoose';

export interface UserData {
  stravaAthleteId: string;
  stravaToken: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
}

interface UserDocument extends Document, UserData {
  _id: Schema.Types.UUID;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<UserDocument>({
  _id: {
    type: Schema.Types.UUID,
    default: () => randomUUID(),
  },
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
}, {
  timestamps: true,
});

export const userModel = model<UserDocument>('User', schema);

export type UserModel = typeof userModel;

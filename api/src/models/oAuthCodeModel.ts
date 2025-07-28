import { randomUUID } from 'crypto';
import { Document, model, Schema } from 'mongoose';

export interface OAuthCodeData {
  userId: string;
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
}

interface OAuthCodeDocument extends Document, OAuthCodeData {
  _id: Schema.Types.UUID;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OAuthCodeDocument>({
  _id: {
    type: Schema.Types.UUID,
    default: () => randomUUID(),
  },
  userId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  codeChallenge: {
    type: String,
    required: true,
  },
  redirectUri: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const oAuthCodeModel = model<OAuthCodeDocument>('OAuthCode', schema);

export type OAuthCodeModel = typeof oAuthCodeModel;

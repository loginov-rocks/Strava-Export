import { randomUUID } from 'crypto';
import { Document, model, Schema } from 'mongoose';

export interface OAuthStateData {
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
  state: string;
}

interface OAuthStateDocument extends Document, OAuthStateData {
  _id: Schema.Types.UUID;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OAuthStateDocument>({
  _id: {
    type: Schema.Types.UUID,
    default: () => randomUUID(),
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
  state: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const oAuthStateModel = model<OAuthStateDocument>('OAuthState', schema);

export type OAuthStateModel = typeof oAuthStateModel;

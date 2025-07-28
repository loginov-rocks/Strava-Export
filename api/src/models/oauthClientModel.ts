import { randomUUID } from 'crypto';
import { Document, model, Schema } from 'mongoose';

export interface OAuthClientData {
  name: string;
  redirectUris: string[];
  scope: string;
}

interface OAuthClientDocument extends Document, OAuthClientData {
  _id: Schema.Types.UUID;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OAuthClientDocument>({
  _id: {
    type: Schema.Types.UUID,
    default: () => randomUUID(),
  },
  name: {
    type: String,
    required: true,
  },
  redirectUris: {
    type: [String],
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const oAuthClientModel = model<OAuthClientDocument>('OAuthClient', schema);

export type OAuthClientModel = typeof oAuthClientModel;

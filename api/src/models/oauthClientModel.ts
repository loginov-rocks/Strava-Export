import { model, Schema, Types } from 'mongoose';

export interface OAuthClientSchema {
  name: string;
  redirectUris: string[];
  scope: string;
}

export interface OAuthClientDocument extends OAuthClientSchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OAuthClientDocument>({
  name: String,
  redirectUris: [String],
  scope: String,
}, {
  timestamps: true,
});

export const oauthClientModel = model<OAuthClientDocument>('OAuthClient', schema);

export type OAuthClientModel = typeof oauthClientModel;

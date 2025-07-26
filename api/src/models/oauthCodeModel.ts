import { model, Schema, Types } from 'mongoose';

export interface OAuthCodeSchema {
  userId: string;
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
}

export interface OAuthCodeDocument extends OAuthCodeSchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OAuthCodeDocument>({
  userId: String,
  clientId: String,
  codeChallenge: String,
  redirectUri: String,
  scope: String,
}, {
  timestamps: true,
});

export const oauthCodeModel = model<OAuthCodeDocument>('OAuthCode', schema);

export type OAuthCodeModel = typeof oauthCodeModel;

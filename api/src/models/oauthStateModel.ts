import { model, Schema, Types } from 'mongoose';

export interface OAuthStateSchema {
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
  state: string;
}

export interface OAuthStateDocument extends OAuthStateSchema {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OAuthStateDocument>({
  clientId: String,
  codeChallenge: String,
  redirectUri: String,
  scope: String,
  state: String,
}, {
  timestamps: true,
});

export const oauthStateModel = model<OAuthStateDocument>('OAuthState', schema);

export type OAuthStateModel = typeof oauthStateModel;

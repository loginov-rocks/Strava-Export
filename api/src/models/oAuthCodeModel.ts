import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface OAuthCodeData {
  userId: string;
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
}

export interface OAuthCodeDocument extends BaseDocument, OAuthCodeData { }

const schema = createBaseSchema<OAuthCodeDocument>({
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
});

export const oAuthCodeModel = model<OAuthCodeDocument>('OAuthCode', schema);

export type OAuthCodeModel = typeof oAuthCodeModel;

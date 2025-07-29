import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface OAuthStateData {
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
  state: string;
}

export interface OAuthStateDocument extends BaseDocument, OAuthStateData { }

const schema = createBaseSchema<OAuthStateDocument>({
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
});

export const oAuthStateModel = model<OAuthStateDocument>('OAuthState', schema);

export type OAuthStateModel = typeof oAuthStateModel;

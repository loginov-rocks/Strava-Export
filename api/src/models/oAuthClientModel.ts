import { model } from 'mongoose';

import { BaseDocument, createBaseSchema } from './BaseModel';

export interface OAuthClientData {
  name: string;
  redirectUris: string[];
  scope: string;
}

export interface OAuthClientDocument extends BaseDocument, OAuthClientData { }

const schema = createBaseSchema<OAuthClientDocument>({
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
});

export const oAuthClientModel = model<OAuthClientDocument>('OAuthClient', schema);

export type OAuthClientModel = typeof oAuthClientModel;

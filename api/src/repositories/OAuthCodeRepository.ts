import { OAuthCodeData, OAuthCodeDocument, OAuthCodeModel } from '../models/oAuthCodeModel';

import { BaseRepository } from './BaseRepository';

interface Options {
  oAuthCodeModel: OAuthCodeModel;
}

export class OAuthCodeRepository extends BaseRepository<OAuthCodeData, OAuthCodeDocument> {
  constructor({ oAuthCodeModel }: Options) {
    super({ model: oAuthCodeModel });
  }
}

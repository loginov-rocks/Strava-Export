import { OAuthClientData, OAuthClientDocument, OAuthClientModel } from '../models/oAuthClientModel';

import { BaseRepository } from './BaseRepository';

interface Options {
  oAuthClientModel: OAuthClientModel;
}

export class OAuthClientRepository extends BaseRepository<OAuthClientData, OAuthClientDocument> {
  constructor({ oAuthClientModel }: Options) {
    super({ model: oAuthClientModel });
  }
}

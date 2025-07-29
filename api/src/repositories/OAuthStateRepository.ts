import { OAuthStateData, OAuthStateDocument, OAuthStateModel } from '../models/oAuthStateModel';

import { BaseRepository } from './BaseRepository';

interface Options {
  oAuthStateModel: OAuthStateModel;
}

export class OAuthStateRepository extends BaseRepository<OAuthStateData, OAuthStateDocument> {
  constructor({ oAuthStateModel }: Options) {
    super({ model: oAuthStateModel });
  }
}

import { StravaApiClient } from '../apiClients/StravaApiClient';
import { OAuthClientRepository } from '../repositories/OAuthClientRepository';
import { OAuthCodeRepository } from '../repositories/OAuthCodeRepository';
import { OAuthStateRepository } from '../repositories/OAuthStateRepository';

import { TokenService } from './TokenService';
import { UserService } from './UserService';

interface Options {
  oauthClientRepository: OAuthClientRepository;
  oauthCodeRepository: OAuthCodeRepository;
  oauthStateRepository: OAuthStateRepository;
  stravaApiClient: StravaApiClient;
  tokenService: TokenService;
  userService: UserService;
}

interface CreateClientParams {
  name: string;
  redirectUris: string[];
  scope: string;
}

interface CreateCodeParams {
  userId: string;
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
}

interface CreateStateParams {
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  scope: string;
  state: string;
}

// TODO: Draft.
export class OAuthService {
  private readonly oauthClientRepository: OAuthClientRepository;
  private readonly oauthCodeRepository: OAuthCodeRepository;
  private readonly oauthStateRepository: OAuthStateRepository;
  private readonly stravaApiClient: StravaApiClient;
  private readonly tokenService: TokenService;
  private readonly userService: UserService;

  constructor({
    oauthClientRepository, oauthCodeRepository, oauthStateRepository, stravaApiClient, tokenService, userService,
  }: Options) {
    this.oauthClientRepository = oauthClientRepository;
    this.oauthCodeRepository = oauthCodeRepository;
    this.oauthStateRepository = oauthStateRepository;
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userService = userService;
  }

  public buildStravaAuthorizeUrl(redirectUri: string, state?: string) {
    return this.stravaApiClient.buildAuthorizeUrl(redirectUri, state);
  }

  public createClient(params: CreateClientParams) {
    return this.oauthClientRepository.create(params);
  }

  public createCode(params: CreateCodeParams) {
    return this.oauthCodeRepository.create(params);
  }

  public createState(params: CreateStateParams) {
    return this.oauthStateRepository.create(params);
  }

  public createTokens(userId: string, clientId: string, scope: string) {
    const { expiresIn: accessTokenExpiresIn, jwt: accessToken } = this.tokenService.signAccessToken({ userId, clientId, scope });
    const { expiresIn: refreshTokenExpiresIn, jwt: refreshToken } = this.tokenService.signRefreshToken({ userId, clientId, scope });

    return { accessToken, accessTokenExpiresIn, refreshToken, refreshTokenExpiresIn };
  }

  public deleteCode(codeId: string) {
    return this.oauthCodeRepository.deleteById(codeId);
  }

  public deleteState(stateId: string) {
    return this.oauthStateRepository.deleteById(stateId);
  }

  public getClient(clientId: string) {
    return this.oauthClientRepository.findById(clientId);
  }

  public getCode(codeId: string) {
    return this.oauthCodeRepository.findById(codeId);
  }

  public getState(stateId: string) {
    return this.oauthStateRepository.findById(stateId);
  }

  // Disabled to keep signature consistent.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async authorizeStravaUser(code: string, scope?: string, state?: string) {
    const user = await this.userService.createOrUpdateUserWithStravaAuthCode(code);

    return user.id;
  }

  public verifyRefreshToken(refreshToken: string) {
    return this.tokenService.verifyRefreshToken(refreshToken);
  }
}

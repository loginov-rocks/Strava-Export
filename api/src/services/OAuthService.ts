import { createHash } from 'crypto';

import { StravaApiClient } from '../apiClients/StravaApiClient';
import { OAuthClientRepository } from '../repositories/OAuthClientRepository';
import { OAuthCodeRepository } from '../repositories/OAuthCodeRepository';
import { OAuthStateRepository } from '../repositories/OAuthStateRepository';
import { UserRepository } from '../repositories/UserRepository';

import { TokenService } from './TokenService';

interface Options {
  apiBaseUrl: string;
  oauthClientRepository: OAuthClientRepository;
  oauthCodeRepository: OAuthCodeRepository;
  oauthStateRepository: OAuthStateRepository;
  stravaApiClient: StravaApiClient;
  tokenService: TokenService;
  userRepository: UserRepository;
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

export class OAuthService {
  private readonly apiBaseUrl: string;
  private readonly oauthClientRepository: OAuthClientRepository;
  private readonly oauthCodeRepository: OAuthCodeRepository;
  private readonly oauthStateRepository: OAuthStateRepository;
  private readonly stravaApiClient: StravaApiClient;
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;

  constructor({
    apiBaseUrl, oauthClientRepository, oauthCodeRepository, oauthStateRepository, stravaApiClient, tokenService,
    userRepository,
  }: Options) {
    this.apiBaseUrl = apiBaseUrl;
    this.oauthClientRepository = oauthClientRepository;
    this.oauthCodeRepository = oauthCodeRepository;
    this.oauthStateRepository = oauthStateRepository;
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  public buildAuthorizeUrl(redirectPath: string, state?: string) {
    const redirectUri = `${this.apiBaseUrl}${redirectPath}`;

    return this.stravaApiClient.buildAuthorizeUrl(redirectUri, state);
  }

  public computeChallenge(verifier: string) {
    return createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
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
    return this.oauthCodeRepository.deleteOneById(codeId);
  }

  public deleteState(stateId: string) {
    return this.oauthStateRepository.deleteOneById(stateId);
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
  public async validateCode(code: string, scope?: string, state?: string) {
    const tokenResponse = await this.stravaApiClient.token(code);

    const stravaAthleteId = tokenResponse.athlete.id.toString();
    const userData = {
      stravaAthleteId,
      stravaToken: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: new Date(tokenResponse.expires_at * 1000),
      }
    };

    const user = await this.userRepository.createOrUpdateByStravaAthleteId(stravaAthleteId, userData);

    return user.id;
  }

  public verifyRefreshToken(refreshToken: string) {
    return this.tokenService.verifyRefreshToken(refreshToken);
  }
}

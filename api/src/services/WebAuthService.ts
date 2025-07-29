import { StravaApiClient } from '../apiClients/StravaApiClient';

import { TokenService } from './TokenService';
import { UserService } from './UserService';

interface Options {
  apiBaseUrl: string;
  stravaApiClient: StravaApiClient;
  tokenService: TokenService;
  userService: UserService;
}

export class WebAuthService {
  private readonly apiBaseUrl: string;
  private readonly stravaApiClient: StravaApiClient;
  private readonly tokenService: TokenService;
  private readonly userService: UserService;

  constructor({ apiBaseUrl, stravaApiClient, tokenService, userService }: Options) {
    this.apiBaseUrl = apiBaseUrl;
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userService = userService;
  }

  public buildAuthorizeUrl(redirectPath: string, state?: string) {
    const redirectUri = `${this.apiBaseUrl}${redirectPath}`;

    return this.stravaApiClient.buildAuthorizeUrl(redirectUri, state);
  }

  private createTokens(userId: string) {
    const { expiresIn: accessTokenExpiresIn, jwt: accessToken } = this.tokenService.signAccessToken({ userId });
    const { expiresIn: refreshTokenExpiresIn, jwt: refreshToken } = this.tokenService.signRefreshToken({ userId });

    return { accessToken, accessTokenExpiresIn, refreshToken, refreshTokenExpiresIn };
  }

  // Disabled to keep signature consistent.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async exchangeCode(code: string, scope?: string, state?: string) {
    const user = await this.userService.createOrUpdateUserWithStravaAuthCode(code);

    return this.createTokens(user.id);
  }

  public refreshTokens(userId: string) {
    return this.createTokens(userId);
  }
}

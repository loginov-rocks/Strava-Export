import { StravaApiClient } from '../apiClients/StravaApiClient';

import { TokenService } from './TokenService';
import { UserService } from './UserService';

interface Options {
  stravaApiClient: StravaApiClient;
  tokenService: TokenService;
  userService: UserService;
}

export class WebAuthService {
  private readonly stravaApiClient: StravaApiClient;
  private readonly tokenService: TokenService;
  private readonly userService: UserService;

  constructor({ stravaApiClient, tokenService, userService }: Options) {
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userService = userService;
  }

  // Disabled to keep signature consistent.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async authorizeStravaUserAndCreateTokens(code: string, scope?: string, state?: string) {
    const user = await this.userService.createOrUpdateUserWithStravaAuthCode(code);

    return this.createTokens(user.id);
  }

  public buildStravaAuthorizeUrl(redirectUri: string, state?: string) {
    return this.stravaApiClient.buildAuthorizeUrl(redirectUri, state);
  }

  public async refreshTokens(userId: string) {
    const user = await this.userService.getUser(userId);

    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    return this.createTokens(userId);
  }

  private createTokens(userId: string) {
    const { expiresIn: accessTokenExpiresIn, jwt: accessToken } = this.tokenService.signAccessToken({ userId });
    const { expiresIn: refreshTokenExpiresIn, jwt: refreshToken } = this.tokenService.signRefreshToken({ userId });

    return { accessToken, accessTokenExpiresIn, refreshToken, refreshTokenExpiresIn };
  }
}

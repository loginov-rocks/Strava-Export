import { StravaApiClient } from '../apiClients/StravaApiClient';
import { UserRepository } from '../repositories/UserRepository';

import { TokenService } from './TokenService';

interface Options {
  apiUrl: string;
  stravaApiClient: StravaApiClient;
  tokenService: TokenService;
  userRepository: UserRepository;
}

export class AuthService {
  private readonly apiUrl: string;
  private readonly stravaApiClient: StravaApiClient;
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;

  constructor({ apiUrl, stravaApiClient, tokenService, userRepository }: Options) {
    this.apiUrl = apiUrl;
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  public buildAuthorizeUrl(redirectPath: string, state?: string) {
    const redirectUri = `${this.apiUrl}${redirectPath}`;

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

    return this.createTokens(user._id.toString());
  }

  public refreshTokens(userId: string) {
    return this.createTokens(userId);
  }
}

import { StravaApiClient } from '../apiClients/StravaApiClient';
import { UserRepository } from '../repositories/UserRepository';
import { TokenService } from './TokenService';

interface Options {
  stravaApiClient: StravaApiClient;
  tokenService: TokenService;
  userRepository: UserRepository;
  webAppUrl: string;
}

export class AuthService {
  private readonly stravaApiClient: StravaApiClient;
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  private readonly webAppUrl: string;

  constructor({ stravaApiClient, tokenService, userRepository, webAppUrl }: Options) {
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userRepository = userRepository;
    this.webAppUrl = webAppUrl;
  }

  public getAuthorizeUrl(redirectUri: string, state?: string) {
    // TODO: Return.
    // if (!this.matchesOrigin(redirectUri, this.webAppUrl)) {
    // throw new Error(`Redirect URI does not match web app URL: "${this.webAppUrl}"`);
    // }

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

  private matchesOrigin(redirectUrl: string, originUrl: string) {
    let origin, redirect;
    try {
      origin = new URL(originUrl);
      redirect = new URL(redirectUrl);
    } catch {
      return false;
    }

    return redirect.protocol === origin.protocol && redirect.hostname === origin.hostname
      && redirect.port === origin.port;
  }
}

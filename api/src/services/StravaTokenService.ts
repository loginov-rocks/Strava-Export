import { StravaApiClient } from '../apiClients/StravaApiClient';
import { UserRepository } from '../repositories/UserRepository';

interface Options {
  stravaApiClient: StravaApiClient;
  userRepository: UserRepository;
}

export class StravaTokenService {
  private readonly stravaApiClient: StravaApiClient;
  private readonly userRepository: UserRepository;

  private readonly accessTokenCache: Map<string, { accessToken: string, expiresAt: Date }>;

  constructor({ stravaApiClient, userRepository }: Options) {
    this.stravaApiClient = stravaApiClient;
    this.userRepository = userRepository;

    // Using cache for access tokens only to keep refresh tokens encrypted in the database.
    this.accessTokenCache = new Map();
  }

  public async getAccessToken(userId: string) {
    const cachedAccessToken = this.getCachedAccessToken(userId);

    if (cachedAccessToken) {
      return cachedAccessToken;
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    if (new Date() < new Date(user.stravaToken.expiresAt)) {
      this.cacheAccessToken(userId, user.stravaToken.accessToken, new Date(user.stravaToken.expiresAt));

      return user.stravaToken.accessToken;
    }

    const refreshTokenResponse = await this.stravaApiClient.refreshToken(user.stravaToken.refreshToken);

    const userData = {
      stravaToken: {
        accessToken: refreshTokenResponse.access_token,
        refreshToken: refreshTokenResponse.refresh_token,
        expiresAt: new Date(refreshTokenResponse.expires_at * 1000),
      }
    };

    await this.userRepository.updateById(userId, userData);

    this.cacheAccessToken(userId, userData.stravaToken.accessToken, userData.stravaToken.expiresAt);

    return userData.stravaToken.accessToken;
  }

  private getCachedAccessToken(userId: string) {
    const cached = this.accessTokenCache.get(userId);

    if (!cached) {
      return null;
    }

    if (new Date() >= cached.expiresAt) {
      this.accessTokenCache.delete(userId);

      return null;
    }

    return cached.accessToken;
  }

  private cacheAccessToken(userId: string, accessToken: string, expiresAt: Date) {
    this.accessTokenCache.set(userId, { accessToken, expiresAt });
  }
}

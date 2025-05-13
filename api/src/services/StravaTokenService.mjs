export class StravaTokenService {
  constructor({ stravaApiClient, userRepository }) {
    this.stravaApiClient = stravaApiClient;
    this.userRepository = userRepository;

    // Using cache for access tokens only to keep refresh tokens encrypted in the database.
    this.accessTokenCache = new Map();
  }

  async getAccessToken(userId) {
    const cachedAccessToken = this.getCachedAccessToken(userId);

    if (cachedAccessToken) {
      return cachedAccessToken;
    }

    const user = await this.userRepository.findById(userId);

    if (new Date() < new Date(user.stravaToken.expiresAt)) {
      this.cacheAccessToken(userId, user.stravaToken.accessToken, user.stravaToken.expiresAt);

      return user.stravaToken.accessToken;
    }

    const refreshTokenResponse = await this.stravaApiClient.refreshToken(user.stravaToken);

    const userData = {
      stravaToken: {
        accessToken: refreshTokenResponse.access_token,
        refreshToken: refreshTokenResponse.refresh_token,
        expiresAt: new Date(refreshTokenResponse.expires_at * 1000),
      }
    };

    await this.userRepository.updateOneById(userId, userData);

    this.cacheAccessToken(userId, userData.stravaToken.accessToken, userData.stravaToken.expiresAt);

    return refreshTokenResponse.access_token;
  }

  getCachedAccessToken(userId) {
    const cached = this.accessTokenCache.get(userId);

    if (!cached) {
      return null;
    }

    if (new Date() >= new Date(cached.expiresAt)) {
      return null;
    }

    return cached.accessToken;
  }

  cacheAccessToken(userId, accessToken, expiresAt) {
    this.accessTokenCache.set(userId, { accessToken, expiresAt });
  }
}

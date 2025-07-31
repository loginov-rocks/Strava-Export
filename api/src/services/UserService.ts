import { StravaApiClient } from '../apiClients/StravaApiClient';
import { UpdateUserData, UserRepository } from '../repositories/UserRepository';
import { isValidNonEmptyString } from '../utils/isValid';

interface Options {
  stravaApiClient: StravaApiClient;
  userRepository: UserRepository;
}

export class UserService {
  private readonly stravaApiClient: StravaApiClient;
  private readonly userRepository: UserRepository;

  private readonly stravaAccessTokenCache: Map<string, { accessToken: string, expiresAt: Date }>;

  constructor({ stravaApiClient, userRepository }: Options) {
    this.stravaApiClient = stravaApiClient;
    this.userRepository = userRepository;

    // Using cache for access tokens only to keep refresh tokens encrypted in the database.
    this.stravaAccessTokenCache = new Map();
  }

  public async createOrUpdateUserWithStravaAuthCode(code: string) {
    const tokenResponse = await this.stravaApiClient.token(code);

    const stravaAthleteId = tokenResponse.athlete.id.toString();
    const userData = {
      stravaAthleteId,
      stravaToken: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: new Date(tokenResponse.expires_at * 1000),
      },
      isPublic: false,
      stravaProfile: {
        firstName: isValidNonEmptyString(tokenResponse.athlete.firstname) ? tokenResponse.athlete.firstname : undefined,
        lastName: isValidNonEmptyString(tokenResponse.athlete.lastname) ? tokenResponse.athlete.lastname : undefined,
        bio: isValidNonEmptyString(tokenResponse.athlete.bio) ? tokenResponse.athlete.bio : undefined,
        city: isValidNonEmptyString(tokenResponse.athlete.city) ? tokenResponse.athlete.city : undefined,
        state: isValidNonEmptyString(tokenResponse.athlete.state) ? tokenResponse.athlete.state : undefined,
        country: isValidNonEmptyString(tokenResponse.athlete.country) ? tokenResponse.athlete.country : undefined,
        avatarUrl: isValidNonEmptyString(tokenResponse.athlete.profile) ? tokenResponse.athlete.profile : undefined,
      },
    };

    return this.userRepository.createOrUpdateByStravaAthleteId(stravaAthleteId, userData);
  }

  public getUser(userId: string) {
    return this.userRepository.findById(userId);
  }

  public getUserByStravaAthleteId(stravaAthleteId: string) {
    return this.userRepository.findByStravaAthleteId(stravaAthleteId);
  }

  public async getStravaAccessToken(userId: string) {
    const cachedAccessToken = this.getCachedStravaAccessToken(userId);

    if (cachedAccessToken) {
      return cachedAccessToken;
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    if (new Date() < new Date(user.stravaToken.expiresAt)) {
      this.cacheStravaAccessToken(userId, user.stravaToken.accessToken, new Date(user.stravaToken.expiresAt));

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

    this.cacheStravaAccessToken(userId, userData.stravaToken.accessToken, userData.stravaToken.expiresAt);

    return userData.stravaToken.accessToken;
  }

  public updateUser(userId: string, userData: UpdateUserData) {
    return this.userRepository.updateByIdAndReturn(userId, userData);
  }

  private getCachedStravaAccessToken(userId: string) {
    const cached = this.stravaAccessTokenCache.get(userId);

    if (!cached) {
      return null;
    }

    if (new Date() >= cached.expiresAt) {
      this.stravaAccessTokenCache.delete(userId);

      return null;
    }

    return cached.accessToken;
  }

  private cacheStravaAccessToken(userId: string, accessToken: string, expiresAt: Date) {
    this.stravaAccessTokenCache.set(userId, { accessToken, expiresAt });
  }
}

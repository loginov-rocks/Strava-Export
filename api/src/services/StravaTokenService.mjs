export class StravaTokenService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  // TODO: Think about cache, token expiration and refresh.
  async getAccessToken(userId) {
    const user = await this.userRepository.findById(userId);

    return user.stravaToken.accessToken;
  }
}

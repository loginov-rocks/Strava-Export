import jsonwebtoken from 'jsonwebtoken';

export class StravaAuthService {
  constructor({ jwtSecret, stravaApiClient, userRepository }) {
    this.jwtSecret = jwtSecret;
    this.stravaApiClient = stravaApiClient;
    this.userRepository = userRepository;
  }

  getClientCredentials() {
    return {
      clientId: this.stravaApiClient.getClientId(),
    };
  }

  async exchangeCode(code) {
    const tokenResponse = await this.stravaApiClient.token(code);

    const athleteId = tokenResponse.athlete.id.toString();
    const token = {
      // TODO: Encrypt.
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: new Date(tokenResponse.expires_at * 1000),
    };

    const user = await this.userRepository.findOneByAthleteId(athleteId);

    if (user) {
      await this.userRepository.updateOneById(user.id, { token });
    } else {
      await this.userRepository.create({ athleteId, token });
    }

    return jsonwebtoken.sign({ sub: athleteId }, this.jwtSecret);
  }
}

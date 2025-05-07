export class AuthService {
  constructor({ jwtService, stravaApiClient, userRepository, webAppUrl }) {
    this.jwtService = jwtService;
    this.stravaApiClient = stravaApiClient;
    this.userRepository = userRepository;
    this.webAppUrl = webAppUrl;
  }

  getAuthorizationUrl(redirectUri, state) {
    if (!this.matchesOrigin(redirectUri, this.webAppUrl)) {
      throw new Error(`Redirect URI does not match web app URL: "${this.webAppUrl}"`);
    }

    return this.stravaApiClient.buildAuthorizationUrl(redirectUri, state);
  }

  async exchangeCode(code, scope, state) {
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

    return this.jwtService.sign({ athleteId });
  }

  matchesOrigin(redirectUrl, originUrl) {
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

export class AuthService {
  constructor({ jwtService, stravaApiClient, userRepository, webAppUrl }) {
    this.jwtService = jwtService;
    this.stravaApiClient = stravaApiClient;
    this.userRepository = userRepository;
    this.webAppUrl = webAppUrl;
  }

  getAuthorizeUrl(redirectUri, state) {
    if (!this.matchesOrigin(redirectUri, this.webAppUrl)) {
      throw new Error(`Redirect URI does not match web app URL: "${this.webAppUrl}"`);
    }

    return this.stravaApiClient.buildAuthorizeUrl(redirectUri, state);
  }

  async exchangeCode(code, scope, state) {
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

    return this.jwtService.sign({ userId: user._id });
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

export class AuthService {
  constructor({ stravaApiClient, tokenService, userRepository, webAppUrl }) {
    this.stravaApiClient = stravaApiClient;
    this.tokenService = tokenService;
    this.userRepository = userRepository;
    this.webAppUrl = webAppUrl;
  }

  getAuthorizeUrl(redirectUri, state) {
    if (!this.matchesOrigin(redirectUri, this.webAppUrl)) {
      throw new Error(`Redirect URI does not match web app URL: "${this.webAppUrl}"`);
    }

    return this.stravaApiClient.buildAuthorizeUrl(redirectUri, state);
  }

  createTokens(userId) {
    const { expiresIn: accessTokenExpiresIn, jwt: accessToken } = this.tokenService.signAccessToken({ userId });
    const { expiresIn: refreshTokenExpiresIn, jwt: refreshToken } = this.tokenService.signRefreshToken({ userId });

    return { accessToken, accessTokenExpiresIn, refreshToken, refreshTokenExpiresIn };
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

    return this.createTokens(user._id);
  }

  refreshTokens(userId) {
    return this.createTokens(userId);
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

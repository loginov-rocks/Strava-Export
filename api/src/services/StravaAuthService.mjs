export class StravaAuthService {
  constructor({ stravaApiClient }) {
    this.stravaApiClient = stravaApiClient;
  }

  getClientCredentials() {
    return {
      clientId: this.stravaApiClient.getClientId(),
    };
  }

  exchangeCode(code) {
    return this.stravaApiClient.token(code);
  }
}

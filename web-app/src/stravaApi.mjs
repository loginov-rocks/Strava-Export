export class StravaApi {
  constructor({ baseUrl, clientId, redirectUri }) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  authorize() {
    const urlSearchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'activity:read_all',
    });

    const url = `${this.baseUrl}/oauth/authorize?${urlSearchParams.toString()}`;

    window.location.href = url;
  }
}

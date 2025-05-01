export class StravaApi {
  constructor({ baseUrl, clientId, clientSecret }) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async token(code) {
    const url = `${this.baseUrl}/oauth/token`;

    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
    };

    const body = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
    });

    const json = await response.json();

    if (json.error) {
      throw json.error;
    }

    return json;
  }
}

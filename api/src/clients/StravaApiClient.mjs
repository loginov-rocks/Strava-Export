export class StravaApiClient {
  constructor({ baseUrl, clientId, clientSecret }) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getActivities(accessToken, page, perPage) {
    const urlSearchParams = new URLSearchParams({
      page,
      per_page: perPage,
    });

    const url = `${this.baseUrl}/api/v3/athlete/activities?${urlSearchParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error;
    }

    return response.json();
  }

  async getActivity(accessToken, activityId) {
    const url = `${this.baseUrl}/api/v3/activities/${activityId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error;
    }

    return response.json();
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

    if (!response.ok) {
      throw new Error;
    }

    return response.json();
  }
}

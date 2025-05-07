import { ApiClient } from './ApiClient.mjs';

export class StravaApiClient extends ApiClient {
  constructor(options) {
    super(options);

    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
  }

  buildAuthorizationUrl(redirectUri, state) {
    const urlSearchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'activity:read_all',
    });

    if (state) {
      urlSearchParams.append('state', state);
    }

    return `${this.baseUrl}/oauth/authorize?${urlSearchParams.toString()}`;
  }

  getActivities(accessToken, page, perPage) {
    return this.request('/api/v3/athlete/activities', {
      accessToken,
      urlSearchParams: new URLSearchParams({
        page,
        per_page: perPage,
      })
    });
  }

  getActivity(accessToken, activityId) {
    return this.request(`/api/v3/activities/${activityId}`, { accessToken });
  }

  token(code) {
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
    };

    return this.request('/oauth/token', {
      body: new URLSearchParams(params).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
    });
  }
}

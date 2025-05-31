import { ApiClient, Options as ApiClientOptions } from './ApiClient';

interface Options extends ApiClientOptions {
  clientId: string;
  clientSecret: string;
}

export interface StravaActivity {
  id: string;
}

export class StravaApiClient extends ApiClient {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(options: Options) {
    super(options);

    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
  }

  public buildAuthorizeUrl(redirectUri: string, state?: string) {
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

  public getActivities(accessToken: string, page?: number, perPage?: number): Promise<StravaActivity[]> {
    return this.request('/api/v3/athlete/activities', {
      accessToken,
      urlSearchParams: new URLSearchParams({
        page,
        per_page: perPage,
      })
    });
  }

  public getActivity(accessToken: string, activityId: string) {
    return this.request(`/api/v3/activities/${activityId}`, { accessToken });
  }

  private requestToken(params: Record<string, string>) {
    return this.request('/api/v3/oauth/token', {
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        ...params,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
    });
  }

  public token(code: string) {
    return this.requestToken({
      grant_type: 'authorization_code',
      code,
    });
  }

  public refreshToken(refreshToken: string) {
    return this.requestToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }
}

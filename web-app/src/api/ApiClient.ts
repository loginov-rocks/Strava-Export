interface Options {
  baseUrl: string;
}

interface RequestOptions {
  body?: string;
  method?: string;
  urlSearchParams?: URLSearchParams;
  withoutAuth?: boolean;
  withoutRefresh?: boolean;
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor({ baseUrl }: Options) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { urlSearchParams, withoutAuth, withoutRefresh, ...customParams } = options;

    const url = `${this.baseUrl}${endpoint}${urlSearchParams ? `?${urlSearchParams.toString()}` : ''}`;

    const params = {
      ...customParams,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (!withoutAuth) {
      // @ts-ignore
      params.credentials = 'include';
    }

    let response;
    try {
      response = await fetch(url, params);
    } catch (error) {
      console.error(`Failed to fetch "${endpoint}":`, error);
      // @ts-ignore
      throw new Error(`Failed to fetch "${endpoint}": ${error.message}`);
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      // Refresh tokens mechanism: not ideal, but simple.
      if (response.status === 401 && !withoutRefresh) {
        // If the request failed with an Unauthorized error and refresh is allowed, try to refresh the tokens first.
        // If the refresh fails, it will throw a refresh error.
        await this.postAuthRefresh();
        // Otherwise, if the refresh succeeded, repeat the original request with the same parameters.
        return this.request(endpoint, options);
      }

      const error = new Error(`Unsuccessful response from "${endpoint}"`);
      // @ts-ignore
      error.status = response.status;
      // @ts-ignore
      error.statusText = response.statusText;

      throw error;
    }

    try {
      return isJson ? await response.json() : await response.text();
    } catch (error) {
      console.error(`Failed to parse successful response from "${endpoint}":`, error);
      // @ts-ignore
      throw new Error(`Failed to parse successful response from "${endpoint}": ${error.message}`);
    }
  }

  getAuthMe() {
    return this.request('/auth/me');
  }

  getAuthStrava(redirectUri: string, state?: string) {
    const urlSearchParams = new URLSearchParams({
      redirectUri,
    });

    if (state) {
      urlSearchParams.append('state', state);
    }

    return this.request('/auth/strava', {
      urlSearchParams,
      withoutAuth: true,
    });
  }

  getLoginUrl() {
    return `${this.baseUrl}/auth/login`;
  }

  postAuthToken(code: string, scope: string, state: string) {
    return this.request('/auth/token', {
      body: JSON.stringify({ code, scope, state }),
      method: 'post',
      withoutRefresh: true,
    });
  }

  postAuthRefresh() {
    return this.request('/auth/refresh', { method: 'post', withoutRefresh: true });
  }

  postAuthLogout() {
    return this.request('/auth/logout', { method: 'post' });
  }

  postSyncJob(data?: { refreshLastDays?: number }) {
    return this.request('/sync', { 
      method: 'post',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  getSyncJob(syncJobId: string) {
    return this.request(`/sync/${syncJobId}`);
  }

  getSyncJobs() {
    return this.request('/sync');
  }

  getUsersMe() {
    return this.request('/users/me');
  }

  patchUsersMe(data: { isPublic: boolean }) {
    return this.request('/users/me', {
      body: JSON.stringify(data),
      method: 'PATCH',
    });
  }

  getActivities(params?: { lastWeeks?: number }) {
    const urlSearchParams = new URLSearchParams();
    if (params?.lastWeeks) {
      urlSearchParams.append('lastWeeks', params.lastWeeks.toString());
    }
    urlSearchParams.append('sort', 'startDateTime');
    urlSearchParams.append('order', 'desc');
    
    return this.request('/activities', {
      urlSearchParams,
    });
  }
}

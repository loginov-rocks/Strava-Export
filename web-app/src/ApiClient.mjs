export class ApiClient {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const { urlSearchParams, withoutAuth, withoutRefresh, ...customParams } = options;

    const url = `${this.baseUrl}${endpoint}${urlSearchParams ? `?${urlSearchParams.toString()}` : ''}`;

    const params = {
      ...customParams,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (!withoutAuth) {
      params.credentials = 'include';
    }

    let response;
    try {
      response = await fetch(url, params);
    } catch (error) {
      console.error(`Failed to fetch "${endpoint}":`, error);
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
      error.status = response.status;
      error.statusText = response.statusText;

      throw error;
    }

    try {
      return isJson ? await response.json() : await response.text();
    } catch (error) {
      console.error(`Failed to parse successful response from "${endpoint}":`, error);
      throw new Error(`Failed to parse successful response from "${endpoint}": ${error.message}`);
    }
  }

  getAuthMe() {
    return this.request('/auth/me');
  }

  getAuthStrava(redirectUri, state) {
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

  postAuthToken(code, scope, state) {
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

  postSyncJob() {
    return this.request('/sync', { method: 'post' });
  }
}

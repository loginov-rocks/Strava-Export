export class ApiClient {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  async getAuth() {
    const url = `${this.baseUrl}/auth`;

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`getAuth received response with HTTP status ${response.status}`);
    }
  }

  async getAuthStrava(redirectUri, state) {
    const urlSearchParams = new URLSearchParams({
      redirectUri,
    });

    if (state) {
      urlSearchParams.append('state', state);
    }

    const url = `${this.baseUrl}/auth/strava?${urlSearchParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`getAuthStrava received response with HTTP status ${response.status}`);
    }

    return response.json();
  }

  async postAuthToken(code, scope, state) {
    const url = `${this.baseUrl}/auth/token`;

    const response = await fetch(url, {
      body: JSON.stringify({ code, scope, state }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
    });

    if (!response.ok) {
      throw new Error(`postAuthToken received response with HTTP status ${response.status}`);
    }
  }

  async postAuthLogout() {
    const url = `${this.baseUrl}/auth/logout`;

    const response = await fetch(url, {
      credentials: 'include',
      method: 'post',
    });

    if (!response.ok) {
      throw new Error(`postAuthLogout received response with HTTP status ${response.status}`);
    }
  }

  async postSyncJob() {
    const url = `${this.baseUrl}/sync`;

    const response = await fetch(url, {
      credentials: 'include',
      method: 'post',
    });

    if (!response.ok) {
      throw new Error(`postSyncJob received response with HTTP status ${response.status}`);
    }

    return response.json();
  }
}

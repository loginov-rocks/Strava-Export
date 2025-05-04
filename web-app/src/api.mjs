export class Api {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  restoreAuthData() {
    const jsonAuthData = window.localStorage.getItem('authData');

    if (jsonAuthData) {
      this.authData = JSON.parse(jsonAuthData);
    }
  }

  setAuthData(authData) {
    this.authData = authData;
    window.localStorage.setItem('authData', JSON.stringify(authData));
  }

  removeAuthData() {
    this.authData = null;
    window.localStorage.removeItem('authData');
  }

  async authClientCredentials() {
    const url = `${this.baseUrl}/auth/client-credentials`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error;
    }

    return response.json();
  }

  async authExchangeCode(code) {
    const url = `${this.baseUrl}/auth/exchange-code`;

    const response = await fetch(url, {
      body: JSON.stringify({
        code,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
    });

    if (!response.ok) {
      throw new Error;
    }

    return response.json();
  }

  async stravaSync() {
    if (!this.authData) {
      throw new Error('Not authorized');
    }

    if (!this.authData.access_token) {
      throw new Error('No access token');
    }

    if (!this.authData.athlete.id) {
      throw new Error('No athlete ID');
    }

    const url = `${this.baseUrl}/sync`;

    const response = await fetch(url, {
      body: JSON.stringify({
        athleteId: this.authData.athlete.id,
      }),
      headers: {
        'Authorization': `Bearer ${this.authData.access_token}`,
        'Content-Type': 'application/json',
      },
      method: 'post',
    });

    if (!response.ok) {
      throw new Error;
    }

    return response.json();
  }
}

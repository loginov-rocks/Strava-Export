export class Api {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  async authClientCredentials() {
    const url = `${this.baseUrl}/auth/client-credentials`;

    const response = await fetch(url);
    const json = await response.json();

    if (json.error) {
      throw json.error;
    }

    return json;
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

    const json = await response.json();

    if (json.error) {
      throw json.error;
    }

    return json;
  }
}

export class ApiClient {
  constructor({ baseUrl, cookie }) {
    this.baseUrl = baseUrl;
    this.cookie = cookie;
  }

  async getLastActivity() {
    const response = await fetch(`${this.baseUrl}/activities/last`, {
      headers: {
        Accept: 'text/plain',
        Cookie: this.cookie,
      },
    });

    return response.text();
  }
}

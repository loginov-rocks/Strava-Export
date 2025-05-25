export class ApiClient {
  constructor({ baseUrl, cookie }) {
    this.baseUrl = baseUrl;
    this.cookie = cookie;
  }

  async request(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const params = {
      headers: {
        Accept: 'text/plain',
        Cookie: this.cookie,
      },
    };

    let response;
    try {
      response = await fetch(url, params);
    } catch (error) {
      console.error(`Failed to fetch "${endpoint}":`, error);
      throw new Error(`Failed to fetch "${endpoint}": ${error.message}`);
    }

    if (!response.ok) {
      console.error(`Unsuccessful response from "${endpoint}":`, {
        status: response.status,
        statusText: response.statusText,
      });

      const error = new Error(`Unsuccessful response from "${endpoint}"`);
      error.status = response.status;
      error.statusText = response.statusText;

      throw error;
    }

    try {
      return await response.text();
    } catch (error) {
      console.error(`Failed to parse successful response from "${endpoint}":`, error);
      throw new Error(`Failed to parse successful response from "${endpoint}": ${error.message}`);
    }
  }

  getActivities() {
    return this.request('/activities');
  }

  getActivity(activityId) {
    return this.request(`/activities/${activityId}`);
  }

  getLastActivity() {
    return this.request('/activities/last');
  }
}

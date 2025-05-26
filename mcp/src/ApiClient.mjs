export class ApiClient {
  constructor({ baseUrl, cookie }) {
    this.baseUrl = baseUrl;
    this.cookie = cookie;
  }

  async request(endpoint, options) {
    const { urlSearchParams } = options;

    const url = `${this.baseUrl}${endpoint}${urlSearchParams ? `?${urlSearchParams.toString()}` : ''}`;
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

  getActivities({ from, order, sort, sportType, to }) {
    const urlSearchParams = new URLSearchParams();

    if (from) {
      urlSearchParams.append('from', from);
    }
    if (order) {
      urlSearchParams.append('order', order);
    }
    if (sort) {
      urlSearchParams.append('sort', sort);
    }
    if (sportType) {
      urlSearchParams.append('sportType', sportType);
    }
    if (to) {
      urlSearchParams.append('to', to);
    }

    return this.request('/activities', { urlSearchParams });
  }

  getActivity(activityId) {
    return this.request(`/activities/${activityId}`);
  }

  getLastActivity({ sportType }) {
    const urlSearchParams = new URLSearchParams();

    if (sportType) {
      urlSearchParams.append('sportType', sportType);
    }

    return this.request('/activities/last', { urlSearchParams });
  }
}

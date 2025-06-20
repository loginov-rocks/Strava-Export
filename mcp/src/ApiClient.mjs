export class ApiClient {
  constructor({ baseUrl, pat }) {
    this.baseUrl = baseUrl;
    this.pat = pat;
  }

  async request(endpoint, options) {
    const { urlSearchParams } = options;

    const url = `${this.baseUrl}${endpoint}${urlSearchParams ? `?${urlSearchParams.toString()}` : ''}`;
    const params = {
      headers: {
        Accept: 'text/plain',
        Authorization: `Bearer ${this.pat}`,
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

  getActivities({ sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order }) {
    const urlSearchParams = new URLSearchParams();

    if (sportType) {
      urlSearchParams.append('sportType', sportType);
    }

    if (from) {
      urlSearchParams.append('from', from);
    }
    if (to) {
      urlSearchParams.append('to', to);
    }

    if (lastDays) {
      urlSearchParams.append('lastDays', lastDays);
    }
    if (lastWeeks) {
      urlSearchParams.append('lastWeeks', lastWeeks);
    }
    if (lastMonths) {
      urlSearchParams.append('lastMonths', lastMonths);
    }
    if (lastYears) {
      urlSearchParams.append('lastYears', lastYears);
    }

    if (sort) {
      urlSearchParams.append('sort', sort);
    }
    if (order) {
      urlSearchParams.append('order', order);
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

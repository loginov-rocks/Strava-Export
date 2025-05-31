export interface Options {
  baseUrl: string;
}

interface RequestOptions {
  accessToken?: string;
  body?: string;
  headers?: Record<string, string>;
  method?: 'get' | 'post';
  timeout?: number;
  urlSearchParams?: URLSearchParams;
}

export abstract class ApiClient {
  protected readonly baseUrl: string;

  constructor({ baseUrl }: Options) {
    this.baseUrl = baseUrl;
  }

  protected async request(endpoint: string, options: RequestOptions = {}) {
    const { accessToken, headers: customHeaders, timeout, urlSearchParams, ...customParams } = options;

    const url = `${this.baseUrl}${endpoint}${urlSearchParams ? `?${urlSearchParams.toString()}` : ''}`;

    const params = {
      ...customParams,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      signal: AbortSignal.timeout(timeout || 60000),
    };

    console.log(`Fetching "${url}"...`);

    let response;
    try {
      response = await fetch(url, params);
    } catch (error) {
      console.error(`Failed to fetch "${endpoint}":`, error);
      throw new Error(`Failed to fetch "${endpoint}": ${error.message}`);
    }

    console.log(`Received response with HTTP status ${response.status}`);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorResponse;
      try {
        errorResponse = isJson ? await response.json() : await response.text();
      } catch (error) {
        console.error(`Failed to parse unsuccessful response from "${endpoint}":`, error);
      }

      let errorText;
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        errorText = errorResponse.message
          || errorResponse.error
          || (errorResponse.errors && Array.isArray(errorResponse.errors) ? errorResponse.errors[0]?.message : null)
          || JSON.stringify(errorResponse);
      } else if (typeof errorResponse === 'string') {
        errorText = errorResponse;
      } else {
        errorText = response.statusText;
      }

      console.error(`Unsuccessful response from "${endpoint}":`, {
        response: errorResponse,
        status: response.status,
        statusText: response.statusText,
        text: errorText,
      });

      const error = new Error(`Unsuccessful response from "${endpoint}": ${errorText}`);
      error.response = errorResponse;
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
}

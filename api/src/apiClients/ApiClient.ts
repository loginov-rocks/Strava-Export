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

class ApiClientHttpError extends Error {
  private readonly response?: unknown;
  private readonly status?: number;
  private readonly statusText?: string;

  constructor(message: string, response?: unknown, status?: number, statusText?: string) {
    super(message);

    this.response = response;
    this.status = status;
    this.statusText = statusText;
  }
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch "${endpoint}": ${errorMessage}`);
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

      throw new ApiClientHttpError(
        `Unsuccessful response from "${endpoint}": ${errorText}`,
        errorResponse,
        response.status,
        response.statusText,
      );
    }

    try {
      return isJson ? await response.json() : await response.text();
    } catch (error) {
      console.error(`Failed to parse successful response from "${endpoint}":`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse successful response from "${endpoint}": ${errorMessage}`);
    }
  }
}

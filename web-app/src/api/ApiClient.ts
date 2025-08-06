export interface Activity {
  id: string;
  name: string;
  sportType: string;
  startDateTime: string;
  distanceKilometers?: number;
  movingTimeMinutes?: number;
  averageSpeedKilometersPerHour?: number;
}

export interface ActivitiesCollection {
  activitiesCount: number;
  activities: Activity[];
}

export type SyncJobStatus = 'created' | 'started' | 'completed' | 'failed';

export interface SyncJob {
  id: string;
  userId: string;
  status: SyncJobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
}

export interface SyncJobsCollection {
  syncJobsCount: number;
  syncJobs: SyncJob[];
}

export interface User {
  stravaAthleteId: string;
  isPublic: boolean;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  avatarUrl: string | null;
}

interface Options {
  baseUrl: string;
}

interface RequestOptions {
  body?: string;
  method?: string;
  urlSearchParams?: URLSearchParams;
  withoutAuth?: boolean;
  withoutRefresh?: boolean;
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor({ baseUrl }: Options) {
    this.baseUrl = baseUrl;
  }

  public getAuthLoginUrl(): string {
    return `${this.baseUrl}/auth/login`;
  }

  public getAuthMe() {
    return this.request('/auth/me');
  }

  public postAuthLogout() {
    return this.request('/auth/logout', { method: 'post' });
  }

  public postSyncJob(params?: { refreshLastDays?: number }): Promise<SyncJob> {
    return this.request('/sync', {
      method: 'post',
      body: params && params.refreshLastDays ? JSON.stringify(params) : undefined,
    });
  }

  public getSyncJobs(): Promise<SyncJobsCollection> {
    return this.request('/sync');
  }

  public getUsersMe(): Promise<User> {
    return this.request('/users/me');
  }

  public patchUsersMe(data: { isPublic: boolean }): Promise<User> {
    return this.request('/users/me', {
      body: JSON.stringify(data),
      method: 'patch',
    });
  }

  public getActivities(params?: { lastMonths?: number }): Promise<ActivitiesCollection> {
    const urlSearchParams = new URLSearchParams();
    if (params?.lastMonths) {
      urlSearchParams.append('lastMonths', params.lastMonths.toString());
    }
    urlSearchParams.append('sort', 'startDateTime');
    urlSearchParams.append('order', 'desc');

    return this.request('/activities', {
      urlSearchParams,
    });
  }

  public getUser(stravaAthleteId: string): Promise<User> {
    return this.request(`/users/${stravaAthleteId}`);
  }

  private postAuthRefresh() {
    return this.request('/auth/refresh', { method: 'post', withoutRefresh: true });
  }

  private async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { method, urlSearchParams, withoutAuth, withoutRefresh, ...customParams } = options;

    const url = `${this.baseUrl}${endpoint}${urlSearchParams ? `?${urlSearchParams.toString()}` : ''}`;

    const params: Record<string, unknown> = {
      ...customParams,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method) {
      params.method = method.toUpperCase();
    }

    if (!withoutAuth) {
      // @ts-ignore
      params.credentials = 'include';
    }

    let response;
    try {
      response = await fetch(url, params);
    } catch (error) {
      console.error(`Failed to fetch "${endpoint}":`, error);
      // @ts-ignore
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
      // @ts-ignore
      error.status = response.status;
      // @ts-ignore
      error.statusText = response.statusText;

      throw error;
    }

    try {
      return isJson ? await response.json() : await response.text();
    } catch (error) {
      console.error(`Failed to parse successful response from "${endpoint}":`, error);
      // @ts-ignore
      throw new Error(`Failed to parse successful response from "${endpoint}": ${error.message}`);
    }
  }
}

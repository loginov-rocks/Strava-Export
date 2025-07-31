import { ApiClient, Options as ApiClientOptions } from './ApiClient';

// @see https://developers.strava.com/docs/reference/#api-models-SportType
export type StravaSportType = 'AlpineSki' | 'BackcountrySki' | 'Badminton' | 'Canoeing' | 'Crossfit' | 'EBikeRide'
  | 'Elliptical' | 'EMountainBikeRide' | 'Golf' | 'GravelRide' | 'Handcycle' | 'HighIntensityIntervalTraining' | 'Hike'
  | 'IceSkate' | 'InlineSkate' | 'Kayaking' | 'Kitesurf' | 'MountainBikeRide' | 'NordicSki' | 'Pickleball' | 'Pilates'
  | 'Racquetball' | 'Ride' | 'RockClimbing' | 'RollerSki' | 'Rowing' | 'Run' | 'Sail' | 'Skateboard' | 'Snowboard'
  | 'Snowshoe' | 'Soccer' | 'Squash' | 'StairStepper' | 'StandUpPaddling' | 'Surfing' | 'Swim' | 'TableTennis'
  | 'Tennis' | 'TrailRun' | 'Velomobile' | 'VirtualRide' | 'VirtualRow' | 'VirtualRun' | 'Walk' | 'WeightTraining'
  | 'Wheelchair' | 'Windsurf' | 'Workout' | 'Yoga';

// @see https://developers.strava.com/docs/reference/#api-models-SummaryActivity
export interface StravaSummaryActivity {
  id: number;
  name: string;
  distance?: number | null;
  moving_time?: number | null;
  total_elevation_gain?: number | null;
  sport_type: StravaSportType;
  start_date: string;
  start_date_local?: string | null;
  // Not mentioned in the API, but found in the response.
  utc_offset?: number | null;
  average_speed?: number | null;
  max_speed?: number | null;
  average_watts?: number | null;
  max_watts?: number | null;
  // Not mentioned in the API, but found in the response.
  average_heartrate?: number | null;
  max_heartrate?: number | null;
}

// @see https://developers.strava.com/docs/reference/#api-models-DetailedActivity
export interface StravaDetailedActivity extends StravaSummaryActivity {
  description?: string | null;
  calories?: number | null;
}

interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  profile: string;
}

interface StravaTokenResponse {
  expires_at: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

interface StravaRefreshTokenResponse {
  expires_at: number;
  refresh_token: string;
  access_token: string;
}

interface Options extends ApiClientOptions {
  clientId: string;
  clientSecret: string;
}

export class StravaApiClient extends ApiClient {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(options: Options) {
    super(options);

    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
  }

  public buildAuthorizeUrl(redirectUri: string, state?: string) {
    const urlSearchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'activity:read_all',
    });

    if (state) {
      urlSearchParams.append('state', state);
    }

    return `${this.baseUrl}/oauth/authorize?${urlSearchParams.toString()}`;
  }

  public getActivities(accessToken: string, page?: number, perPage?: number): Promise<StravaSummaryActivity[]> {
    if (perPage && perPage > 200) {
      throw new Error('Maximum of 200 activites per page can be requested');
    }

    const urlSearchParams = new URLSearchParams();

    if (page) {
      urlSearchParams.append('page', page.toString());
    }
    if (perPage) {
      urlSearchParams.append('per_page', perPage.toString());
    }

    return this.request('/api/v3/athlete/activities', { accessToken, urlSearchParams });
  }

  public getActivity(accessToken: string, activityId: string): Promise<StravaDetailedActivity> {
    return this.request(`/api/v3/activities/${activityId}`, { accessToken });
  }

  public token(code: string): Promise<StravaTokenResponse> {
    return this.requestToken({
      grant_type: 'authorization_code',
      code,
    });
  }

  public refreshToken(refreshToken: string): Promise<StravaRefreshTokenResponse> {
    return this.requestToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  private requestToken(params: Record<string, string>) {
    return this.request('/api/v3/oauth/token', {
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        ...params,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
    });
  }
}

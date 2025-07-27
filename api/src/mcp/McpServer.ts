import { McpServer as McpServerSdk } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport';
import { z } from 'zod';

import { ActivityDtoFactory } from '../dtoFactories/ActivityDtoFactory';
import { ActivityService } from '../services/ActivityService';
import {
  getDateAgoFromDays, getDateAgoFromMonths, getDateAgoFromWeeks, getDateAgoFromYears,
} from '../utils/getDateAgo';
import { isValidIsoDateString, isValidPositiveIntegerString } from '../utils/isValid';

interface Options {
  activityDtoFactory: ActivityDtoFactory;
  activityService: ActivityService;
}

interface ToolResponse {
  // Required to avoid TS error on node_modules/@modelcontextprotocol/sdk/dist/esm/types.d.ts:18703:9
  [x: string]: unknown;
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export class McpServer {
  private readonly activityDtoFactory: ActivityDtoFactory;
  private readonly activityService: ActivityService;

  private server: McpServerSdk | null = null;

  constructor({ activityDtoFactory, activityService }: Options) {
    this.activityDtoFactory = activityDtoFactory;
    this.activityService = activityService;

    this.init();
  }

  public connect(transport: Transport) {
    if (!this.server) {
      throw new Error('MCP server not initialized');
    }

    return this.server.connect(transport);
  }

  private init() {
    this.server = new McpServerSdk({
      name: 'Stravaholics',
      version: '1.0.0',
    });

    this.server.tool(
      'get-all-activities',
      'Get all activities from Strava',
      {
        sportType: z.enum([
          'AlpineSki', 'BackcountrySki', 'Badminton', 'Canoeing', 'Crossfit', 'EBikeRide', 'Elliptical',
          'EMountainBikeRide', 'Golf', 'GravelRide', 'Handcycle', 'HighIntensityIntervalTraining', 'Hike', 'IceSkate',
          'InlineSkate', 'Kayaking', 'Kitesurf', 'MountainBikeRide', 'NordicSki', 'Pickleball', 'Pilates',
          'Racquetball', 'Ride', 'RockClimbing', 'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard',
          'Snowshoe', 'Soccer', 'Squash', 'StairStepper', 'StandUpPaddling', 'Surfing', 'Swim', 'TableTennis',
          'Tennis', 'TrailRun', 'Velomobile', 'VirtualRide', 'VirtualRow', 'VirtualRun', 'Walk', 'WeightTraining',
          'Wheelchair', 'Windsurf', 'Workout', 'Yoga',
        ]).optional().describe('Optional filter by sport type'),
        from: z.string().optional().describe('Optional start date filter in ISO format (e.g. "2024-01-01T00:00:00.000Z")'),
        to: z.string().optional().describe('Optional end date filter in ISO format (e.g. "2024-12-31T23:59:59.999Z")'),
        lastDays: z.number().int().positive().optional().describe('Optional filter to get activities from the last N days (can be used only when `from` and `to` are not specified)'),
        lastWeeks: z.number().int().positive().optional().describe('Optional filter to get activities from the last N weeks (can be used when `from`, `to`, and `lastDays` are not specified)'),
        lastMonths: z.number().int().positive().optional().describe('Optional filter to get activities from the last N months (can be used when `from`, `to`, `lastDays`, and `lastWeeks` are not specified)'),
        lastYears: z.number().int().positive().optional().describe('Optional filter to get activities from the last N years (can be used when `from`, `to`, `lastDays`, `lastWeeks`, and `lastMonths` are not specified)'),
        sort: z.enum(['startDateTime']).optional().describe('Optional sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Optional sort order (ascending or descending)'),
      },
      async ({ sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order }, { authInfo }) => {
        if (!authInfo) {
          return this.respondWithText('Unauthorized');
        }

        let filter;
        try {
          filter = this.createActivitiesFilter({
            sportType, from, to,
            // The following are received like numbers due to parameters configuration.
            lastDays: lastDays?.toString(),
            lastWeeks: lastWeeks?.toString(),
            lastMonths: lastMonths?.toString(),
            lastYears: lastYears?.toString(),
            sort,
            order,
          });
        } catch {
          return this.respondWithText('Bad Request');
        }

        let activities;
        try {
          activities = await this.activityService.getActivitiesByUserId(authInfo.clientId, filter);
        } catch (error) {
          console.error(error);

          return this.respondWithText('Internal Server Error');
        }

        return this.respondWithText(this.activityDtoFactory.createTextCollection(activities));
      },
    );

    this.server.tool(
      'get-activity-by-id',
      'Get activity by ID from Strava',
      {
        activityId: z.string().describe('Activity ID'),
      },
      async ({ activityId }, { authInfo }) => {
        if (!authInfo) {
          return this.respondWithText('Unauthorized');
        }

        let activity;
        try {
          activity = await this.activityService.getActivity(activityId);
        } catch (error) {
          console.error(error);

          return this.respondWithText('Internal Server Error');
        }

        if (!activity || activity.userId !== authInfo.clientId) {
          return this.respondWithText('Not Found');
        }

        return this.respondWithText(this.activityDtoFactory.createText(activity));
      },
    );

    this.server.tool(
      'get-last-activity',
      'Get last activity from Strava',
      {
        sportType: z.enum([
          'AlpineSki', 'BackcountrySki', 'Badminton', 'Canoeing', 'Crossfit', 'EBikeRide', 'Elliptical',
          'EMountainBikeRide', 'Golf', 'GravelRide', 'Handcycle', 'HighIntensityIntervalTraining', 'Hike', 'IceSkate',
          'InlineSkate', 'Kayaking', 'Kitesurf', 'MountainBikeRide', 'NordicSki', 'Pickleball', 'Pilates',
          'Racquetball', 'Ride', 'RockClimbing', 'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard',
          'Snowshoe', 'Soccer', 'Squash', 'StairStepper', 'StandUpPaddling', 'Surfing', 'Swim', 'TableTennis',
          'Tennis', 'TrailRun', 'Velomobile', 'VirtualRide', 'VirtualRow', 'VirtualRun', 'Walk', 'WeightTraining',
          'Wheelchair', 'Windsurf', 'Workout', 'Yoga',
        ]).optional().describe('Optional filter by sport type'),
      },
      async ({ sportType }, { authInfo }) => {
        if (!authInfo) {
          return this.respondWithText('Unauthorized');
        }

        let filter;
        try {
          filter = this.createActivitiesFilter({ sportType });
        } catch {
          return this.respondWithText('Bad Request');
        }

        let activity;
        try {
          activity = await this.activityService.getLastActivityByUserId(authInfo.clientId, filter);
        } catch (error) {
          console.error(error);

          return this.respondWithText('Internal Server Error');
        }

        if (!activity) {
          return this.respondWithText('Not Found');
        }

        return this.respondWithText(this.activityDtoFactory.createText(activity));
      }
    );
  }

  private respondWithText(text: string): ToolResponse {
    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  private createActivitiesFilter({
    sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order,
  }: Record<string, unknown>) {
    // Inherit expected types from the service method signature rather than importing them across layers, which would
    // violate the separation of concerns and architectural boundaries.
    const filter: Parameters<typeof this.activityService.getActivitiesByUserId>[1]
      | Parameters<typeof this.activityService.getLastActivityByUserId>[1] = {};
    const filterValues = this.activityService.getFilterValues();

    if (sportType) {
      // Cast to any for runtime validation since TS only knows the sportType is unknown, not the specific literal
      // union type expected by the filter after validation.
      // eslint-disable-next-line
      if (filterValues.sportType.includes(sportType as any)) {
        filter.sportType = sportType as typeof filterValues.sportType[number];
      } else {
        throw new Error('Parameter "sportType" must be one of the allowed sport type values');
      }
    }

    if (from) {
      if (isValidIsoDateString(from)) {
        filter.from = from as string;
      } else {
        throw new Error('Parameter "from" must be a valid ISO date');
      }
    }

    if (to) {
      if (isValidIsoDateString(to)) {
        filter.to = to as string;
      } else {
        throw new Error('Parameter "to" must be a valid ISO date');
      }
    }

    if (filter.from && filter.to && new Date(filter.from) >= new Date(filter.to)) {
      throw new Error('Parameter "from" must be earlier than parameter "to"');
    }

    if (lastDays) {
      if (!isValidPositiveIntegerString(lastDays)) {
        throw new Error('Parameter "lastDays" must be a valid positive integer');
      }
      // Apply the lastDays filter only when explicit from/to dates are not provided, as they take precedence.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromDays(parseInt(lastDays as string, 10)).toISOString();
      }
    }

    if (lastWeeks) {
      if (!isValidPositiveIntegerString(lastWeeks)) {
        throw new Error('Parameter "lastWeeks" must be a valid positive integer');
      }
      // Apply lastWeeks filter only when explicit from/to dates and lastDays are not provided, as they take
      // precedence and lastDays already sets the from parameter.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromWeeks(parseInt(lastWeeks as string, 10)).toISOString();
      }
    }

    if (lastMonths) {
      if (!isValidPositiveIntegerString(lastMonths)) {
        throw new Error('Parameter "lastMonths" must be a valid positive integer');
      }
      // Apply lastWeeks filter only when explicit from/to dates, lastDays, and lastWeeks are not provided, as they
      // take precedence and lastDays already sets the from parameter.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromMonths(parseInt(lastMonths as string, 10)).toISOString();
      }
    }

    if (lastYears) {
      if (!isValidPositiveIntegerString(lastYears)) {
        throw new Error('Parameter "lastYears" must be a valid positive integer');
      }
      // Apply lastWeeks filter only when explicit from/to dates, lastDays, lastWeeks, and lastMonths are not provided,
      // as they take precedence and lastDays already sets the from parameter.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromYears(parseInt(lastYears as string, 10)).toISOString();
      }
    }

    if (sort) {
      // Cast to any for runtime validation since TS only knows the sort is unknown, not the specific literal union
      // type expected by the filter after validation.
      // eslint-disable-next-line
      if (filterValues.sort.includes(sort as any)) {
        filter.sort = sort as typeof filterValues.sort[number];
      } else {
        throw new Error('Parameter "sort" must be one of the allowed sort values');
      }
    }

    if (order) {
      // Cast to any for runtime validation since TS only knows the order is unknown, not the specific literal union
      // type expected by the filter after validation.
      // eslint-disable-next-line
      if (filterValues.order.includes(order as any)) {
        filter.order = order as typeof filterValues.order[number];
      } else {
        throw new Error('Parameter "order" must be one of the allowed order values');
      }
    }

    return filter;
  }
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { ApiClient } from './ApiClient.mjs';

import { API_BASE_URL, API_PAT } from './constants.mjs';

const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  pat: API_PAT,
});

const server = new McpServer({
  name: 'strava-export',
  version: '0.0.0',
});

const textResponse = (text) => ({
  content: [
    {
      type: 'text',
      text: text,
    },
  ],
});

server.tool(
  'get-all-activities',
  'Get all activities from Strava',
  {
    sportType: z.enum(['Hike', 'Ride', 'Run', 'Swim']).optional().describe('Optional filter by sport type'),
    from: z.string().optional().describe('Optional start date filter in ISO format (e.g. "2024-01-01T00:00:00.000Z")'),
    to: z.string().optional().describe('Optional end date filter in ISO format (e.g. "2024-12-31T23:59:59.999Z")'),
    lastDays: z.number().int().positive().optional().describe('Optional filter to get activities from the last N days (can be used only when `from` and `to` are not specified)'),
    lastWeeks: z.number().int().positive().optional().describe('Optional filter to get activities from the last N weeks (can be used when `from`, `to`, and `lastDays` are not specified)'),
    lastMonths: z.number().int().positive().optional().describe('Optional filter to get activities from the last N months (can be used when `from`, `to`, `lastDays`, and `lastWeeks` are not specified)'),
    lastYears: z.number().int().positive().optional().describe('Optional filter to get activities from the last N years (can be used when `from`, `to`, `lastDays`, `lastWeeks`, and `lastMonths` are not specified)'),
    sort: z.enum(['startDateTime']).optional().describe('Optional sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Optional sort order (ascending or descending)'),
  },
  async ({ sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order }) => {
    const activities = await apiClient.getActivities({
      sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order,
    });

    return textResponse(activities);
  },
);

server.tool(
  'get-activity-by-id',
  'Get activity by ID from Strava',
  {
    activityId: z.string().describe('Activity ID'),
  },
  async ({ activityId }) => {
    const activity = await apiClient.getActivity(activityId);

    return textResponse(activity);
  },
);

server.tool(
  'get-last-activity',
  'Get last activity from Strava',
  {
    sportType: z.enum(['Hike', 'Ride', 'Run', 'Swim']).optional().describe('Optional filter by sport type'),
  },
  async ({ sportType }) => {
    const activity = await apiClient.getLastActivity({ sportType });

    return textResponse(activity);
  },
);

const main = async () => {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('Strava Export MCP Server running on stdio');
};

main()
  .catch((error) => {
    console.error('Fatal error in main():', error);

    process.exit(1);
  });

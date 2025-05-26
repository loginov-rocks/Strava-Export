import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { ApiClient } from './ApiClient.mjs';

import { API_BASE_URL, API_COOKIE } from './constants.mjs';

const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  cookie: API_COOKIE,
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
  'Get all Strava activities',
  {
    sportType: z.enum(['Hike', 'Ride', 'Run', 'Swim']).optional().describe('Filter by sport type (optional)'),
    sort: z.enum(['startDateTime']).optional().describe('Sort field (currently only startDateTime is supported)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order (ascending or descending)'),
    from: z.string().optional().describe('Start date filter in ISO format (e.g., "2024-01-01T00:00:00.000Z")'),
    to: z.string().optional().describe('End date filter in ISO format (e.g., "2024-12-31T23:59:59.999Z")'),
  },
  async ({ from, order, sort, sportType, to }) => {
    const activities = await apiClient.getActivities({ from, order, sort, sportType, to });

    return textResponse(activities);
  },
);

server.tool(
  'get-activity-by-id',
  'Get Strava activity by ID',
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
  'Get last Strava activity',
  {
    sportType: z.enum(['Hike', 'Ride', 'Run', 'Swim']).optional().describe('Filter by sport type (optional)'),
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

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
  async () => {
    const activities = await apiClient.getActivities();

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
  async () => {
    const activity = await apiClient.getLastActivity();

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

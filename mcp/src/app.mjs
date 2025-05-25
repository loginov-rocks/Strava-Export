import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

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

server.tool(
  'get-last-activity',
  'Get last Strava activity details',
  async () => {
    const activity = await apiClient.getLastActivity();

    return {
      content: [
        {
          type: 'text',
          text: activity,
        },
      ],
    };
  }
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

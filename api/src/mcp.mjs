import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'strava-export',
  version: '1.0.0',
});

server.tool(
  'get-last-activity',
  'Get last Strava activity details',
  () => {
    return {
      content: [
        {
          type: "text",
          text: `Activity Name: Run
Sport Type: Run
Date: April 30, 2025
Start Time: 22:08:55 UTC
Distance: 3.36 kilometers
Moving Time: 28.32 minutes
Average Speed: 7.11 km/h
Max Speed: 9.86 km/h
Elevation Gain: 34.2 meters
Average Heart Rate: 139.6 BPM
Maximum Heart Rate: 154 BPM
Calories Burned: 232
Average Power: 147.1 watts
Maximum Power: 229 watts`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Strava Export MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

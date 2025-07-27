import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import { Response } from 'express';

import { McpServer } from '../mcp/McpServer';
import { McpAuthenticatedRequest } from '../middlewares/McpAuthMiddleware';

interface Options {
  mcpServer: McpServer;
}

export class McpStreamableController {
  private readonly mcpServer: McpServer;

  private readonly transportsMap: Map<string, StreamableHTTPServerTransport> = new Map();

  constructor({ mcpServer }: Options) {
    this.mcpServer = mcpServer;

    this.postMcp = this.postMcp.bind(this);
    this.getMcp = this.getMcp.bind(this);
    this.deleteMcp = this.deleteMcp.bind(this);
  }

  public async postMcp(req: McpAuthenticatedRequest, res: Response): Promise<void> {
    const sessionId = req.headers['mcp-session-id'];
    let transport: StreamableHTTPServerTransport;

    if (sessionId && this.transportsMap.has(sessionId as string)) {
      transport = this.transportsMap.get(sessionId as string) as StreamableHTTPServerTransport;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          this.transportsMap.set(sessionId, transport);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          this.transportsMap.delete(transport.sessionId);
        }
      };

      await this.mcpServer.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });

      return;
    }

    await transport.handleRequest(req, res, req.body);
  }

  public getMcp(req: McpAuthenticatedRequest, res: Response): Promise<void> {
    return this.handleSessionRequest(req, res);
  }

  public deleteMcp(req: McpAuthenticatedRequest, res: Response): Promise<void> {
    return this.handleSessionRequest(req, res);
  }

  private async handleSessionRequest(req: McpAuthenticatedRequest, res: Response): Promise<void> {
    const sessionId = req.headers['mcp-session-id'];

    if (!sessionId || !this.transportsMap.has(sessionId as string)) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = this.transportsMap.get(sessionId as string) as StreamableHTTPServerTransport;

    await transport.handleRequest(req, res);
  };
}

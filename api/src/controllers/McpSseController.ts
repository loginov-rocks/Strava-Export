import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Response } from 'express';

import { McpServer } from '../mcp/McpServer';
import { McpAuthenticatedRequest } from '../middlewares/McpAuthMiddleware';

interface Options {
  mcpServer: McpServer;
}

export class McpSseController {
  private readonly mcpServer: McpServer;

  private readonly transportsMap: Map<string, SSEServerTransport> = new Map();

  constructor({ mcpServer }: Options) {
    this.mcpServer = mcpServer;

    this.getSse = this.getSse.bind(this);
    this.postMessages = this.postMessages.bind(this);
  }

  public async getSse(req: McpAuthenticatedRequest, res: Response): Promise<void> {
    const transport = new SSEServerTransport('/messages', res);

    this.transportsMap.set(transport.sessionId, transport);

    res.on('close', () => {
      this.transportsMap.delete(transport.sessionId);
    });

    await this.mcpServer.connect(transport);
  }

  public async postMessages(req: McpAuthenticatedRequest, res: Response): Promise<void> {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).send('Session ID missing');
      return;
    }

    const transport = this.transportsMap.get(sessionId);

    if (!transport) {
      res.status(400).send(`Transport not found for session ID ${sessionId}`);
      return;
    }

    await transport.handlePostMessage(req, res);
  }
}

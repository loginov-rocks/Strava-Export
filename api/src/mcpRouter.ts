import { json, Request, Response, Router } from 'express';

import { mcpAuthMiddleware, mcpSseController, mcpStreamableController, oauthController } from './container';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('OK');
});

router.get('/.well-known/oauth-authorization-server', oauthController.getServerMetadata);

// SSE.
router.get('/sse', mcpAuthMiddleware.requireAuth, mcpSseController.getSse);
router.post('/messages', mcpAuthMiddleware.requireAuth, mcpSseController.postMessages);

// Streamable HTTP.
router.post('/mcp', mcpAuthMiddleware.requireAuth, json(), mcpStreamableController.postMcp);
router.get('/mcp', mcpAuthMiddleware.requireAuth, json(), mcpStreamableController.getMcp);
router.delete('/mcp', mcpAuthMiddleware.requireAuth, json(), mcpStreamableController.deleteMcp);

import { json, Router } from 'express';

import {
  healthcheckController, mcpAuthMiddleware, mcpSseController, mcpStreamableController, oauthController,
} from './container';

// TODO: Draft.
export const mcpRouter = Router();

// Healthcheck.
mcpRouter.get('/', healthcheckController.get);

// OAuth.
mcpRouter.get('/.well-known/oauth-protected-resource', oauthController.getProtectedResource);
mcpRouter.get('/.well-known/oauth-authorization-server', oauthController.getServerMetadata);

// SSE.
mcpRouter.get('/sse', mcpAuthMiddleware.requireAuth, mcpSseController.getSse);
mcpRouter.post('/messages', mcpAuthMiddleware.requireAuth, mcpSseController.postMessages);

// Streamable HTTP.
mcpRouter.post('/mcp', mcpAuthMiddleware.requireAuth, json(), mcpStreamableController.postMcp);
mcpRouter.get('/mcp', mcpAuthMiddleware.requireAuth, json(), mcpStreamableController.getMcp);
mcpRouter.delete('/mcp', mcpAuthMiddleware.requireAuth, json(), mcpStreamableController.deleteMcp);

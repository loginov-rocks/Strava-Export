import express from 'express';

import { PORT } from './constants';
import { mcpRouter } from './mcpRouter';
import { connectMongo } from './mongo';

const app = express();

app.use(mcpRouter);

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`MCP started on port ${PORT}`);
  });
});

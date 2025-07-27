import express from 'express';

import { MONGO_URL, PORT } from './constants';
import { connect as connectDatabase } from './database';
import { router } from './mcpRouter';

const app = express();

app.use(router);

connectDatabase(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App started on port ${PORT}`);
    });
  });

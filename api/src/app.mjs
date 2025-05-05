import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { MONGOOSE_CONNECT_URI, PORT, WEB_APP_URL } from './constants.mjs';
import { connect as connectDatabase } from './database.mjs';
import { router } from './router.mjs';

const app = express();

app.use(cors({
  origin: WEB_APP_URL,
}));
app.use(express.json());
app.use(router);

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App started on port ${PORT}`);
    });
  });

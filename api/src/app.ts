import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { MONGOOSE_CONNECT_URI, PORT, WEB_APP_URL } from './constants';
import { connect as connectDatabase } from './database';
import { router } from './router';

const app = express();

app.use(cookieParser());
app.use(cors({
  credentials: true,
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

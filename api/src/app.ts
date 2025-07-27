import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { MONGO_URL, PORT, WEB_APP_URL } from './constants';
import { connect as connectDatabase } from './database';
import { router } from './router';

const app = express();

app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: WEB_APP_URL,
}));
app.use(express.json());
app.use(router);

connectDatabase(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App started on port ${PORT}`);
    });
  });

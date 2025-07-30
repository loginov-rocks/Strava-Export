import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { appRouter } from './appRouter';
import { PORT, WEB_APP_BASE_URL } from './constants';
import { connectMongo } from './mongo';

const app = express();

// TODO: Check proper body parsing urlencoded vs json.
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: WEB_APP_BASE_URL,
}));
app.use(express.json());
app.use(appRouter);

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
  });
});

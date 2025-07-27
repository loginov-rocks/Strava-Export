import mongoose from 'mongoose';

import { MONGO_URL } from './constants';

export const connectMongo = () => {
  return mongoose.connect(MONGO_URL);
};

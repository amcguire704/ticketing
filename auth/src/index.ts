import mongoose from 'mongoose';
import { app } from './app';

console.log('starting up');

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT environment var must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (e) {
    console.log(e);
  }
  console.log('commected to mongoose');
  app.listen(3000, () => {
    console.log('listineng on 3000!!!!;');
  });
};

start();

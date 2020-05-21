import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current_user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';
import { errorHandler } from './middlewares/error_handler';
import { NotFoundError } from './errors/not_found_error';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', // means that cookies will only be shared when the user is
    //making an http request... in testing we are not making an http request
    //makes it false only if the enviroment var is "test"
  })
);

app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signOutRouter);
app.use(signInRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler } from './middlewares/error_handler';
import cookieSession from 'cookie-session';
import { NotFoundError } from './errors/not_found_error';
import { createTicketRouter } from './routes/new';
import { currentUser } from './middlewares/current_user';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

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

//this needs to be placed after cookie session bc
//so the app can take a look at cookie so it set the req.session property
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

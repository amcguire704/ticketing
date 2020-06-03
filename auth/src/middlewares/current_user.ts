import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestValidationError } from '../errors/request_validation_error';
interface UserPayload {
  id: string;
  email: string;
}
// i wanted to add or extend an existing interface of Request with
// an optional prop called currentUser this is all you need to write
// this is in order to assign the req.currentUser property on line 30ish
//will be set tp userpayload

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload; //as userPayload is just for ts purposes
    req.currentUser = payload;
  } catch (e) {}
  next();
};

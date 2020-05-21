import { Request, Response, NextFunction } from 'express'; //importing the types for TS to understand
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request_validation_error';
// this middleware is distringuished becaseu it takes only 3 args whereas
//error handling takes 4 args

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
};

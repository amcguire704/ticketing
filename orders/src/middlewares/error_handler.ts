import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom_error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //common stucture is errors is gonna be an object with errors property on that
  //property is gonna be an array of objects with message property etc

  if (err instanceof CustomError) {
    // const formattedErrors = err.errors.map((cock) => {
    //   return { message: cock.msg, field: cock.param };
    // });
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(500).send({
    errors: [{ message: 'something went wrong' }], //this gets the string when i create the new Error
  });
};

///alskfhdfsdj

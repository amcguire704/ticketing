import { ValidationError } from 'express-validator';
import { errorHandler } from '../middlewares/error_handler';
import { CustomError } from './custom_error';

export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super('user input error');
    // only becasue we extend bilt in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}

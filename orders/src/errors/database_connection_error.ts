import { CustomError } from './custom_error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Error connecting to database';

  constructor() {
    super('error connecting to DB');
    // only becasue we extend bilt in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}

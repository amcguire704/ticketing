import { Subjects } from './subjects';
import { OrderStatus } from './types/order_status';

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    expiresAt: string; // this needs to be string becasue it will be a date converted to json
    ticket: {
      id: string;
      price: number;
    };
  };
}

import { Publisher } from './basepublisher';
import { OrderCreatedEvent } from './order_created_event';
import { Subjects } from './subjects';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

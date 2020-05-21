import { Publisher } from './basepublisher';
import { OrderCanceledEvent } from './order_canceled_event';
import { Subjects } from './subjects';

export class OrderCanceledPublisher extends Publisher<OrderCanceledEvent> {
  subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
}

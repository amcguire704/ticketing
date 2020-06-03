import { Subjects } from './subjects';
import { Publisher } from './basepublisher';
import { PaymentCreatedEvent } from './payment_created_event';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

import { Publisher } from './basepublisher';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket_created_event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

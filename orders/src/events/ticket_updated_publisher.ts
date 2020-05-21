import { Publisher } from './basepublisher';
import { Subjects } from './subjects';
import { TicketUpdatedEvent } from './ticket_updated_event';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  // have to have both because we tell it it can never change to different value
}

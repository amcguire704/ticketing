import { Message } from 'node-nats-streaming';
import { Subjects } from './subjects';
import { Listener } from './baselistener';
import { TicketUpdatedEvent } from './ticket_updated_event';
import { Ticket } from '../models/ticket';
import { queueGroupName } from './queue_group_name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);
    console.log('logged ticket update');
    if (!ticket) {
      throw new Error('ticket no found');
    }
    const { title, price } = data;

    ticket.set({ title, price });
    await ticket.save();
    msg.ack();
  }
}

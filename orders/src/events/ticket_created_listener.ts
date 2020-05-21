import { Message } from 'node-nats-streaming';
import { Listener } from './baselistener';
import { TicketCreatedEvent } from './ticket_created_event';
import { Subjects } from './subjects';
import { queueGroupName } from './queue_group_name';
import { Ticket } from '../models/ticket';

// now that this is a generic class it means we need to provide an arg for type of T or
// basically define what Subject events are going to be passed to the listener

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated; //spelling matters with this uppercase etc..
  //must apply the annotation above bc TS will think that if we just use the equal that
  //sometime in the future it may change .. by using the Colon we are stating that
  //subject must be of type Subjects.TicketCreated

  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event Data', data);
    console.log(data.title);
    const { title, price, id } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    msg.ack(); // this will singal that the message was successfully parsed
  }
}

import { Listener } from './baselistener';
import { OrderCreatedEvent } from './order_created_event';
import { Subjects } from './subjects';
import { queueGroupName } from './queue_group_name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../models/tickets';
import { TicketUpdatedPublisher } from './ticket_updated_publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // we need to implement functionality to see if the current ticket is
    //available to be edited, meaning if the current ticket is in the porcess of
    //being purchased... if it is then we need to provide the orderId to the owner of the
    //ticket ... then they can make a request on the orderId to find out the
    //status of payment for example

    //find the ticket that order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket throw error
    if (!ticket) {
      throw new Error('ticketnot found');
    }
    //mark the ticket as being reserved by seting the order ID property
    ticket.set({ orderId: data.id });

    //save ticket

    await ticket.save();
    //now we need to emit an event back to other serices that have copies of
    //this ticket to update the version so that all copies stay in sync
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    //ack the message
    msg.ack();
  }
}

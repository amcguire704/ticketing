import { Listener } from './baselistener';
import { OrderCanceledEvent } from './order_canceled_event';
import { Subjects } from './subjects';
import { queueGroupName } from './queue_group_name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../models/tickets';
import { TicketUpdatedPublisher } from './ticket_updated_publisher';

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCanceledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('ticket not found');
    }
    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      price: ticket.price,
      version: ticket.version,
      title: ticket.title,
      userId: ticket.userId,
    });

    msg.ack();
  }
}

import { Listener } from './baselistener';
import { OrderCreatedEvent } from './order_created_event';
import { Subjects } from './subjects';
import { queueGroupName } from './queue_group_name';
import { Message } from 'node-nats-streaming';
import { Order } from '../models/order';
import { TicketUpdatedPublisher } from './ticket_updated_publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    //ack the message
    msg.ack();
  }
}

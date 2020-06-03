import { Listener } from './baselistener';
import { ExpirationCompleteEvent } from './expiration_complete_event';
import { Subjects } from './subjects';
import { queueGroupName } from './queue_group_name';
import { Order, OrderStatus } from '../models/order';
import { Message } from 'node-nats-streaming';
import { OrderCanceledPublisher } from './order_canceled_publisher';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Canceled,
    });
    await order.save();

    new OrderCanceledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id, //i can reference this because of the .populate call on line 17
        //when i pulled the order the .populate fn then populated teh associated ticket
      },
    });
    msg.ack();
  }
}

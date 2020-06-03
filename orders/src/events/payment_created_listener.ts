import { Subjects } from './subjects';
import { Listener } from './baselistener';
import { PaymentCreatedEvent } from './payment_created_event';
import { queueGroupName } from './queue_group_name';
import { Message } from 'node-nats-streaming';
import { Order } from '../models/order';
import { OrderStatus } from './types/order_status';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('not found');
    }
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    msg.ack();
  }
}

import { Listener } from './baselistener';
import { OrderCanceledEvent } from './order_canceled_event';
import { Subjects } from './subjects';
import { queueGroupName } from './queue_group_name';
import { Message } from 'node-nats-streaming';
import { Order } from '../models/order';
import { OrderStatus } from './types/order_status';

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCanceledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1, // this will find the newest version
    });
    if (!order) {
      throw new Error('not found');
    }
    order.set({ status: OrderStatus.Canceled });

    // order!.status = OrderStatus.Canceled;

    await order.save();

    msg.ack();
  }
}

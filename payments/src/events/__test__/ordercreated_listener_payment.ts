import { natsWrapper } from '../../nats-wrapper';
import { OrderCreatedListener } from '../order_created_listener';
import { OrderCreatedEvent } from '../order_created_event';
import mongoose from 'mongoose';
import { OrderStatus } from '../types/order_status';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'dkfjld',
    userId: 'kdjfdl',
    status: OrderStatus.Created,
    ticket: {
      id: 'alkdjf',
      price: 383,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('replicates teh order info', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message ', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

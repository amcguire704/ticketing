import { ExpirationCompleteListener } from '../expiration_complete_listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '../types/order_status';
import { ExpirationCompleteEvent } from '../expiration_complete_event';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'conernt',
    price: 1343,
  });
  await ticket.save();

  const order = Order.build({
    userId: 'sldkfjd',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  //@ts-ignore

  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, order, listener, data, msg };
};

it('updates the order status to canceled', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});
it('emits an orderCanceled event', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  //mock.calls is an array of all the times this function publish has been invoked
  //then it gives the arguements it was called with [1] is the data property
  //then its returned as a JOSN string, which we parse to make it an object
  //then we check the id property of that object below
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

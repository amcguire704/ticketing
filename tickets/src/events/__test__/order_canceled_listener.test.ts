import { natsWrapper } from '../../nats-wrapper';
import { OrderCanceledListener } from '../order_canceled_listener';
import { Ticket } from '../../models/tickets';
import mongoose from 'mongoose';
import { OrderCanceledEvent } from '../order_canceled_event';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCanceledListener(natsWrapper.client);
  const orderId = mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'dkjfsk',
    price: 424,
    userId: 'lksdfjd',
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCanceledEvent['data'] = {
    id: orderId,
    version: ticket.version,
    ticket: {
      id: ticket.id,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { msg, data, ticket, listener, orderId };
};

it('updates the ticket, publishese the event, acks the message', async () => {
  const { data, listener, msg, orderId, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

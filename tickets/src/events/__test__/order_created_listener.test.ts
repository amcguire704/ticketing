import { OrderCreatedListener } from '../order_created_listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/tickets';
import { OrderCreatedEvent } from '../order_created_event';
import mongoose from 'mongoose';
import { OrderStatus } from '../types/order_status';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  //create instance of listener
  const listener = await new OrderCreatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    title: 'slkdfj',
    price: 23,
    userId: 'skdfldkf',
  });
  await ticket.save();

  //create fake data object(orderCRetedEvent interface)
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'skdjflkd',
    expiresAt: 'akjdfjkd',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it('sets the orderId of the ticket', async () => {
  const { listener, data, ticket, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, ticket, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
it('publishes an ticket updated evetn ', async () => {
  const { listener, ticket, msg, data } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).toEqual(data.id);
});

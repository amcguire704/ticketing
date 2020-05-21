import { TicketUpdatedListener } from '../ticket_updated_listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '../ticket_updated_event';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  //Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //Create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'sdkjf',
    price: 449,
  });
  await ticket.save();

  //Create a facke data object
  //@ts-ignore
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new title',
    price: 999,
    userId: 'slkdjf',
  };
  // Create fake msg object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //return all this sutff
  return { msg, data, ticket, listener };
};
it('finds and updates and saves a ticket', async () => {
  const { msg, data, listener, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.id).toEqual(data.id);
});

it('acks the message', async () => {
  const { msg, data, listener, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('doesnt process an event if it is into the future version', async () => {
  const { msg, data, ticket, listener } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (e) {}
  expect(msg.ack).not.toHaveBeenCalled();
});

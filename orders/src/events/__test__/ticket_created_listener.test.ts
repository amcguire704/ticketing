import { TicketCreatedListener } from '../ticket_created_listener';
import { natsWrapper } from '../../nats-wrapper';
import { TicketCreatedEvent } from '../ticket_created_event';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

const setup = async () => {
  //create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //create a fake event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'conter',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create a fake message object
  //@ts-ignore

  const msg: Message = {
    ack: jest.fn(), //it will count how many times this callback gets called
  };
  return { listener, data, msg };
};
it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  //create an instance of listener
  //create a fake event
  //create a fake message object
  //call the onMessage fucntion with hte date object and message object
  await listener.onMessage(data, msg);
  //make sure the ack function is called
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  //create an instance of listener
  //create a fake event
  //create a fake message object
  //call the onMessage fucntion with hte date object and message object
  await listener.onMessage(data, msg);
  //make sure teh ack fucntion was called
  expect(msg.ack).toHaveBeenCalled();
});

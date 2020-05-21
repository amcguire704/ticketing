import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns error if ticket is already reserved', async () => {
  //create ticket - save to DB
  const ticket = Ticket.build({
    title: 'new',
    price: 100,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // create an order
  const order = Order.build({
    ticket,
    userId: 'slkdjkdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  //check to see if reserved
  await order.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  //make a ticket
  const ticket = Ticket.build({
    title: 'aksdfd',
    price: 300,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  console.log(order.body);
});

it('emits and order created event ', async () => {
  const ticket = Ticket.build({
    title: 'aksdfd',
    price: 300,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

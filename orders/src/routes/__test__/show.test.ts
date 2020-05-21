import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  //create the ticket
  const ticket = await Ticket.build({
    title: 'asdhf',
    price: 2930,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  //make follw up request to fetch the order

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send(order.ticket)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user trys to fetch anothers order', async () => {
  //create the ticket
  const ticket = await Ticket.build({
    title: 'asdhf',
    price: 2930,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  //make follw up request to fetch the order

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send(order.ticket)
    .expect(401);

  expect(fetchedOrder.id).not.toEqual(order.id);
});

import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('order can be deleted or canceled', async () => {
  //create a ticket

  const ticket = Ticket.build({
    title: 'slkdfjd',
    price: 29,
    id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const user = global.signin();
  //create a order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  //requrest to cancel
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const check = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual('canceled');
});

it('it emits an event to let other services know it was canceled', async () => {
  const ticket = Ticket.build({
    title: 'slkdfjd',
    price: 29,
    id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const user = global.signin();
  //create a order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  //requrest to cancel
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

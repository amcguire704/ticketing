import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../models/tickets';

it('returns a 404 if provided id does not exist', async () => {
  //creates a random ID based of the types file then puts it as a hex string

  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'aldkfjd',
      price: 20,
    })
    .expect(404);
});
it('returns a 401 if user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'aldkfjd',
      price: 20,
    })
    .expect(401);
});
it('returns a 401 if user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'aldkfjd',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // the above was placed by a random id generated in the sigin function, the belwo
    //is making the request as a different user with a new random ID
    .set('Cookie', global.signin())
    .send({
      title: 'sldf',
      price: 10,
    })
    .expect(401);
});
it('returns a 400 if user provides a invlaid title or price', async () => {
  const cookie = global.signin();
  // have to use the same cookie for both creation of ticket and update attempt

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sdfjsldkf',
      price: 20,
    });
  console.log(response.body.userId);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'ddfdfdf',
      price: -10,
    })
    .expect(400);
});

it('updates the ticket with prvided inputs', async () => {
  const cookie = global.signin();
  // have to use the same cookie for both creation of ticket and update attempt
  console.log(cookie);
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sdfjsldkf',
      price: 20,
    });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual(20);
});

it('successfully publishes an event ', async () => {
  const cookie = global.signin();
  // have to use the same cookie for both creation of ticket and update attempt
  console.log(cookie);
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sdfjsldkf',
      price: 20,
    });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('doesnt allow a reserved ticket to be updated', async () => {
  const cookie = global.signin();
  // have to use the same cookie for both creation of ticket and update attempt
  console.log(cookie);
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sdfjsldkf',
      price: 20,
    });
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(400);
});

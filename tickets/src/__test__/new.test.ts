import request from 'supertest';
import { Ticket } from '../models/tickets';
import { app } from '../app';
import { natsWrapper } from '../nats-wrapper';

//this is the mock file so we can run an instance of NATS client in the
//test files without actually having to implement the class

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});
it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).toEqual(401);
});
it('returns a status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});
it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it('reutrns an error if an invalid price was provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'sdfkjdkf',
      price: -10,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'sdfkjdkf',
    })
    .expect(400);
});

it('it creates a ticket with valid inputs', async () => {
  //add a check to make sure ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'adkfj',
      price: 20,
    })
    .expect(201);
  console.log(response.body);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual('adkfj');
});

it('publishes an event ', async () => {
  const title = 'alkdk';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

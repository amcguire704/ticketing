import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';

// it('reutrns a 404 if the iticket is not found', async () => {
//   const id = new mongoose.Types.ObjectId().toHexString();
//   //this will generate a valid object ID
//   const response = await request(app)
//     .get(`/api/tickets/${id}`)
//     .send()
//     .expect(404);
// });

it('it returns a ticket if the ticket is found', async () => {
  const title = 'concert';
  const price = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

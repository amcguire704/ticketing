import request from 'supertest';
import { app } from '../../app';

it('responses with details about the current user', async () => {
  //cookkie doesnt get carried over to the second request so the the current user is null
  //this is bc of supertest
  const cookie = await global.signin();
  // now i need to take the above cookie and include it in the request below

  const response = await request(app)
    .get('/api/users/currentuser')
    //.set is how you set differnt headers
    .set('Cookie', cookie)
    .send()
    .expect(200);

  console.log(response.body);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responses with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});

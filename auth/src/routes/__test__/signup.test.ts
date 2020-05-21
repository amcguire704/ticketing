import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('returns a 400 for a bad request from email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testd.com',
      password: 'password',
    })
    .expect(400);
});
it('returns a 400 for a bad request from  password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testdd@emiail.com',
      password: 'p',
    })
    .expect(400);
});
it('returns a 400 with missing email paswrod', async () => {
  await request(app) //need to await the frist and can return the last test
    .post('/api/users/signup')
    .send({})
    .expect(400);

  return request(app).post('/api/users/signup').send({}).expect(201);
});
it('disallowes duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('its sets a coookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});

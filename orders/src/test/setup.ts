import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import { Request } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
//this is declaring that there is a global vaiable that has a
//property of signin and it returns a type array of strings
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}
let mongo: any;
jest.mock('../nats-wrapper');
beforeAll(async () => {
  process.env.JWT_KEY = 'balcn';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  //this will reset the publish function callback on the mock Natswrapper file so that
  // one test does not polute the other.. bc it keeps track of how many times the individual functions
  //get called
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
global.signin = () => {
  //build a JWT payload {id, email, }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  //create the JWT we have to include JWT_KEY
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //BUild up session object {jwt: MY_JWT}
  const session = { jwt: token };
  //turn the session into JSON
  const sessionJSON = JSON.stringify(session);

  //take the JSON and encode as base 64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string that the cookie with the encoded data

  return [`express:sess=${base64}`];
};

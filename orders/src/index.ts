import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/ticket_created_listener';
import { TicketUpdatedListener } from './events/ticket_updated_listener';
import { ExpirationCompleteListener } from './events/expiration_complete_listener';
import { PaymentCreatedListener } from './events/payment_created_listener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT environment var must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NAts client id  must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('Nats URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('Nats cluster ID must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('nats connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
    new TicketCreatedListener(natsWrapper.client).listen();

    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (e) {
    console.log(e);
  }
  console.log('connected to mongoose');
  app.listen(3000, () => {
    console.log('listening on 3000!!!!;');
  });
};

start();

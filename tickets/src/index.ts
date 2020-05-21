import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedPublisher } from './events/ticket_created_publisher';
import { Ticket } from './models/tickets';
import { TicketCreatedListener } from './events/ticket_created_listener';
import { OrderCreatedListener } from './events/order_created_listener';
import { OrderCanceledListener } from './events/order_canceled_listener';

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
      console.log('nasts connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
    new TicketCreatedListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCanceledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (e) {
    console.log(e);
  }
  console.log('commected to mongoose');
  app.listen(3000, () => {
    console.log('listineng on 3000!!!!;');
  });
};

start();

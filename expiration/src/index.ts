import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/order_created_listener';

const start = async () => {
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.log(err);
  }
};

start();

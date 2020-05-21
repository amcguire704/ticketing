import nats from 'node-nats-streaming';
//sometimes documents will call client 'stan'
import { TicketCreatedPublisher } from './events/ticket_created_publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

//i was able to use async here becasue we set us a Promise on the PUblish function
//on the basePublisher publish function
stan.on('connect', async () => {
  console.log('publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20,
      userId: '132432',
    });
  } catch (err) {
    console.error(err);
  }
});
//   //anytime you pass data you must send as a string.. so that why JSON stringify
//   const data = JSON.stringify({
//     id: '123',
//     title: 'asshoole',
//     price: 20,
//   });
//   stan.publish('ticket:created', data, () => {
//     console.log('evetn published');
//   });

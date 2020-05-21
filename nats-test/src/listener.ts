import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket_created_listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('listener connected');
  stan.on('close', () => {
    console.log('nats connection closed');
    process.exit();
  });

  //this is where we declare a new instance of TicketCreated Listener
  new TicketCreatedListener(stan).listen();
});

//   const options = stan
//     .subscriptionOptions()
//     .setManualAckMode(true) //it will be up to us to acknowledge the event was sucessful
//     // if we dont acknowledge then it will autmativally resend the event to be processed again

//     .setDeliverAllAvailable() //this will deliver all the events that have been emitted in the past
//     .setDurableName('ABC123'); // this will keep track of which subscription has processed which events--incase something is offline it will keep track of that as well
//   //the listener subscription gets the name as well as the durable subcriptions in the NATS streaming

//   const subscription = stan.subscribe(
//     'ticket:created', //name of the channel
//     'orders_service_queue_group', //second arg is the queue group-- it will persist the durable name if a listener goes down it will keep it up
//     options
//   );
//   subscription.on('message', (msg: Message) => {
//     const data = msg.getData();

//     if (typeof data == 'string') {
//       console.log(`received event #${msg.getSequence()}, with data: ${data}`);
//     }

//     msg.ack();
//   });
// });

process.on('SIGINT', () => stan.close()); //watching for iterrupt signals
process.on('SIGTERM', () => stan.close()); //looking for terminate signals

// now we need to create am instance of the class and the constructor for the Listener
//class requires that we pass in a preconstucted client se line 53

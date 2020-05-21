import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}
//this is a generic class t extends means that any time we want to set up a subclass
// of listener we need to provide the types T for types ... meaning that the matching the
//listener i am creating with the data profile of the event it is listening for
// this allow typescrupt to check and make sure the event data types match up with the
//construction of a new subclass
export abstract class Listener<T extends Event> {
  abstract subject: T['subject']; //abstract means these must be defined by the subclass
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8')); // this is if is a buffer
  }
}

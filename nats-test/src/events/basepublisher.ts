import { Stan } from 'node-nats-streaming';

import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}
export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  // we need to wait( use async ) but insteead we have to use a promise
  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        //senond arg must be a string hence JSON stringify
        if (err) {
          return reject(err);
        }
        console.log('event published to subject', this.subject);
        resolve();
      });
    });
    this.client.publish(this.subject, JSON.stringify(data), () => {
      //senond arg must be a string hence JSON stringify

      console.log('event published');
    });
  }
}
